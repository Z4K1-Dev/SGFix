import { db } from './db'

/**
 * Optimized database queries with proper indexing
 */

// Optimized berita queries
export const beritaQueries = {
  // Get published berita with pagination
  getPublished: async (page: number = 1, limit: number = 10, kategoriId?: string) => {
    const skip = (page - 1) * limit
    const where: any = { published: true }
    
    if (kategoriId && kategoriId !== 'semua') {
      where.kategoriId = kategoriId
    }

    const [data, total] = await Promise.all([
      db.berita.findMany({
        where,
        include: {
          kategori: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.berita.count({ where })
    ])

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  },

  // Get berita by ID with proper indexing
  getById: async (id: string) => {
    return db.berita.findUnique({
      where: {
        id,
        published: true
      },
      include: {
        kategori: true
      }
    })
  },

  // Get popular berita based on views
  getPopular: async (limit: number = 5) => {
    return db.berita.findMany({
      where: { published: true },
      include: {
        kategori: true
      },
      orderBy: {
        views: 'desc'
      },
      take: limit
    })
  },

  // Search berita with full-text search simulation
  search: async (query: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit
    
    const where = {
      published: true,
      OR: [
        { judul: { contains: query } },
        { isi: { contains: query } }
      ]
    }

    const [data, total] = await Promise.all([
      db.berita.findMany({
        where,
        include: {
          kategori: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.berita.count({ where })
    ])

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  }
}

// Optimized pengaduan queries
export const pengaduanQueries = {
  // Get pengaduan with pagination and status filtering
  getWithPagination: async (page: number = 1, limit: number = 10, status?: string) => {
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (status) {
      where.status = status
    }

    const [data, total] = await Promise.all([
      db.pengaduan.findMany({
        where,
        include: {
          balasan: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.pengaduan.count({ where })
    ])

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  },

  // Get pengaduan by ID with all related data
  getById: async (id: string) => {
    return db.pengaduan.findUnique({
      where: { id },
      include: {
        balasan: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })
  },

  // Get pengaduan statistics
  getStats: async () => {
    const stats = await Promise.all([
      db.pengaduan.count({ where: { status: 'BARU' } }),
      db.pengaduan.count({ where: { status: 'DITAMPUNG' } }),
      db.pengaduan.count({ where: { status: 'DITERUSKAN' } }),
      db.pengaduan.count({ where: { status: 'DIKERJAKAN' } }),
      db.pengaduan.count({ where: { status: 'SELESAI' } }),
      db.pengaduan.count()
    ])

    return {
      baru: stats[0],
      diproses: stats[1],
      ditampah: stats[2],
      dikerjakan: stats[3],
      selesai: stats[4],
      total: stats[5]
    }
  }
}

// Optimized notifikasi queries
export const notifikasiQueries = {
  // Get unread notifications for admin
  getUnreadAdmin: async (limit: number = 10) => {
    return db.notifikasi.findMany({
      where: {
        untukAdmin: true,
        dibaca: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })
  },

  // Get notifications with pagination
  getWithPagination: async (page: number = 1, limit: number = 10, untukAdmin?: boolean) => {
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (untukAdmin !== undefined) {
      where.untukAdmin = untukAdmin
    }

    const [data, total] = await Promise.all([
      db.notifikasi.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.notifikasi.count({ where })
    ])

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    return db.notifikasi.update({
      where: { id },
      data: { dibaca: true }
    })
  },

  // Mark all notifications as read for admin/user
  markAllAsRead: async (untukAdmin: boolean) => {
    return db.notifikasi.updateMany({
      where: {
        untukAdmin,
        dibaca: false
      },
      data: { dibaca: true }
    })
  }
}

// Optimized kategori queries
export const kategoriQueries = {
  // Get all kategori with berita count
  getAllWithCount: async () => {
    return db.kategori.findMany({
      include: {
        _count: {
          select: {
            berita: {
              where: { published: true }
            }
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    })
  },

  // Get kategori by ID
  getById: async (id: string) => {
    return db.kategori.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            berita: {
              where: { published: true }
            }
          }
        }
      }
    })
  }
}

// Batch operations for better performance
export const batchOperations = {
  // Update berita views in batch
  updateBeritaViews: async (beritaIds: string[]) => {
    const operations = beritaIds.map(id => 
      db.berita.update({
        where: { id },
        data: { views: { increment: 1 } }
      })
    )
    
    return db.$transaction(operations)
  },

  // Create multiple notifications
  createNotifications: async (notifications: Array<{
    judul: string
    pesan: string
    tipe: string
    untukAdmin: boolean
    beritaId?: string
    pengaduanId?: string
    balasanId?: string
  }>) => {
    const operations = notifications.map(notification =>
      db.notifikasi.create({
        data: {
          judul: notification.judul,
          pesan: notification.pesan,
          tipe: notification.tipe as any, // Cast to any to bypass type checking
          untukAdmin: notification.untukAdmin,
          ...(notification.beritaId && { beritaId: notification.beritaId }),
          ...(notification.pengaduanId && { pengaduanId: notification.pengaduanId }),
          ...(notification.balasanId && { balasanId: notification.balasanId })
        }
      })
    )
    
    return db.$transaction(operations)
  }
}