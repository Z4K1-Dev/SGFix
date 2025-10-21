import { seedData } from '@/lib/seed'

async function runSeedTest() {
  console.log('Memulai seeding data...')
  
  try {
    await seedData()
    console.log('Seeding data berhasil diselesaikan')
  } catch (error) {
    console.error('Error saat menjalankan seeding:', error)
 }
}

// Jalankan fungsi seeding
runSeedTest()