/**
 * Test file untuk fungsi matematika sederhana
 * Digunakan untuk memverifikasi instalasi Vitest berfungsi dengan benar
 */

import { describe, expect, it } from 'vitest'

/**
 * Fungsi penjumlahan dua bilangan
 * @param a - Bilangan pertama
 * @param b - Bilangan kedua
 * @returns Hasil penjumlahan a dan b
 */
export function sum(a: number, b: number): number {
  return a + b
}

/**
 * Fungsi pengurangan dua bilangan
 * @param a - Bilangan pertama
 * @param b - Bilangan kedua
 * @returns Hasil pengurangan a dikurangi b
 */
export function subtract(a: number, b: number): number {
  return a - b
}

/**
 * Fungsi perkalian dua bilangan
 * @param a - Bilangan pertama
 * @param b - Bilangan kedua
 * @returns Hasil perkalian a dan b
 */
export function multiply(a: number, b: number): number {
  return a * b
}

/**
 * Fungsi pembagian dua bilangan
 * @param a - Bilangan pertama
 * @param b - Bilangan kedua
 * @returns Hasil pembagian a dibagi b
 * @throws Error jika b adalah 0
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Pembagi tidak boleh nol')
  }
  return a / b
}

// Test cases untuk fungsi matematika
describe('Fungsi Matematika', () => {
  describe('sum', () => {
    it('harus menambahkan dua bilangan dengan benar', () => {
      expect(sum(1, 2)).toBe(3)
      expect(sum(-1, 5)).toBe(4)
      expect(sum(0, 0)).toBe(0)
      expect(sum(1.5, 2.5)).toBe(4)
    })
  })

  describe('subtract', () => {
    it('harus mengurangi dua bilangan dengan benar', () => {
      expect(subtract(5, 3)).toBe(2)
      expect(subtract(3, 5)).toBe(-2)
      expect(subtract(0, 0)).toBe(0)
      expect(subtract(10, 7.5)).toBe(2.5)
    })
  })

  describe('multiply', () => {
    it('harus mengalikan dua bilangan dengan benar', () => {
      expect(multiply(2, 3)).toBe(6)
      expect(multiply(-2, 3)).toBe(-6)
      expect(multiply(0, 5)).toBe(0)
      expect(multiply(1.5, 2)).toBe(3)
    })
  })

  describe('divide', () => {
    it('harus membagi dua bilangan dengan benar', () => {
      expect(divide(6, 2)).toBe(3)
      expect(divide(5, 2)).toBe(2.5)
      expect(divide(-10, 2)).toBe(-5)
    })

    it('harus melempar error jika pembagi adalah 0', () => {
      expect(() => divide(10, 0)).toThrow('Pembagi tidak boleh nol')
    })
  })
})