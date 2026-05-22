import React, { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '../../lib/ui.js'

export default function PredictionChart({ flock }) {
  const chartData = useMemo(() => {
    if (!flock) return []

    const { birdAge, currentWeight, timeline } = flock
    
    // Simulate historical growth points for a realistic curve
    const history = []
    const intervals = 3
    for (let i = 0; i < intervals; i++) {
      const fraction = i / intervals
      const age = Math.round(birdAge * fraction)
      // Logistic curve approximation for history: weight starts around 0.05 and grows to current
      const weight = 0.05 + (currentWeight - 0.05) * Math.sin((fraction * Math.PI) / 2)
      history.push({
        age,
        actual: Math.round(weight * 100) / 100,
        predicted: null,
      })
    }

    // Connect history to prediction
    // Current point is both actual and prediction starting point
    const currentPoint = {
      age: birdAge,
      actual: currentWeight,
      predicted: currentWeight,
    }

    // Projected points from the timeline (starting from index 1)
    const projections = timeline.slice(1).map((point) => ({
      age: point.age,
      actual: null,
      predicted: point.weight,
    }))

    return [...history, currentPoint, ...projections]
  }, [flock])

  if (!flock) return null

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          
          <XAxis
            dataKey="age"
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Age (Days)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
          />
          
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#fff',
              fontWeight: '700',
            }}
            formatter={(value, name) => [
              `${value} kg`,
              name === 'actual' ? 'Historical Weight' : 'Projected Weight',
            ]}
            labelFormatter={(label) => `Age: ${label} Days`}
          />
          
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
          
          <Line
            name="actual"
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, stroke: '#10b981', fill: '#fff' }}
            activeDot={{ r: 6 }}
          />
          <Line
            name="predicted"
            type="monotone"
            dataKey="predicted"
            stroke="#10b981"
            strokeWidth={3}
            strokeDasharray="6 6"
            dot={{ r: 4, strokeWidth: 2, stroke: '#10b981', strokeDasharray: '0', fill: 'transparent' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
