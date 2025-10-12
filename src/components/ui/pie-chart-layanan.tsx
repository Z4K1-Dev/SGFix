"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive pie chart for layanan status"

const layananData = [
  { status: "Diterima", count: 7, fill: "var(--color-diterima)" },
  { status: "Diproses", count: 5, fill: "var(--color-diproses)" },
  { status: "Diverifikasi", count: 3, fill: "var(--color-diverifikasi)" },
  { status: "Selesai", count: 10, fill: "var(--color-selesai)" },
  { status: "Ditolak", count: 2, fill: "var(--color-ditolak)" },
]

const chartConfig = {
  layanan: {
    label: "Layanan",
  },
  diterima: {
    label: "Diterima",
    color: "var(--chart-1)",
  },
  diproses: {
    label: "Diproses",
    color: "var(--chart-2)",
  },
  diverifikasi: {
    label: "Diverifikasi",
    color: "var(--chart-3)",
  },
  selesai: {
    label: "Selesai",
    color: "var(--chart-4)",
  },
  ditolak: {
    label: "Ditolak",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartPieLayanan() {
  const id = "pie-layanan"
  const [activeStatus, setActiveStatus] = React.useState(layananData[0].status)

  const activeIndex = React.useMemo(
    () => layananData.findIndex((item) => item.status === activeStatus),
    [activeStatus]
  )
  const statuses = React.useMemo(() => layananData.map((item) => item.status), [])

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Statistik Layanan</CardTitle>
          <CardDescription>Distribusi status layanan masuk</CardDescription>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Pilih status"
          >
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {statuses.map((key) => {
              const config = chartConfig[key.toLowerCase() as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key.toLowerCase()})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={layananData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {layananData[activeIndex].count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Layanan
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
