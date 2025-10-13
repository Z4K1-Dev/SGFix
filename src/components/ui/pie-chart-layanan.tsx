"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

export const description = "An interactive pie chart for layanan status with toggle button legend"

const layananData = [
  { status: "Diterima", count: 7, fill: "#87bb8a" },
  { status: "Diproses", count: 5, fill: "#5fa463" },
  { status: "Diverifikasi", count: 3, fill: "#388e3c" },
  { status: "Selesai", count: 10, fill: "#2c7130" },
  { status: "Ditolak", count: 2, fill: "#afd1b1" },
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

  // Pisahkan data menjadi dua baris
  const firstRow = layananData.slice(0, 3)
  const secondRow = layananData.slice(3, 5)

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Statistik Layanan</CardTitle>
          <CardDescription>Distribusi status layanan masuk</CardDescription>
        </div>
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
      
      {/* Legend Toggle Button di tengah bawah */}
      <CardContent className="flex flex-col items-center justify-center pb-6">
        <div className="grid grid-cols-3 gap-2 mb-2">
          {firstRow.map((item) => (
            <Button
              key={item.status}
              variant={activeStatus === item.status ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStatus(item.status)}
              className={cn(
                "flex items-center gap-2 text-xs h-6 px-2",
                activeStatus === item.status && "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-accent"
              )}
            >
              <div
                className="w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: item.fill,
                }}
              />
              {item.status}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {secondRow.map((item) => (
            <Button
              key={item.status}
              variant={activeStatus === item.status ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStatus(item.status)}
              className={cn(
                "flex items-center gap-2 text-xs h-6 px-2",
                activeStatus === item.status && "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-accent"
              )}
            >
              <div
                className="w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: item.fill,
                }}
              />
              {item.status}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
