import type { ChangeEvent } from 'react'
import { initialForm } from './constants'

/** The estimator form shape, derived from the initial values. */
export type Form = typeof initialForm

/** Curried field-change handler passed down to the form inputs. */
export type Setter = (
  key: keyof Form,
) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void

export type PredictionResult = {
  estimated_annual_cost: number
  contributions: Record<string, number>
  report: string
}
