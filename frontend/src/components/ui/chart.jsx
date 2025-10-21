import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "../../lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark"
}

const ChartContext = React.createContext(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: [
          `[data-chart=${id}] {`,
          ...colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.light ?? itemConfig.color
            return color ? `  --color-${key}: ${color};` : null
          }),
          `}`,
          // Dark theme styles
          `[data-chart=${id}].dark,`,
          `[data-chart=${id}][data-theme="dark"] {`,
          ...colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.dark ?? itemConfig.color
            return color ? `  --color-${key}: ${color};` : null
          }),
          `}`
        ]
          .flat()
          .filter(Boolean)
          .join("\n")
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      label,
      labelFormatter,
      formatter,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      labelClassName,
      formatterClassName,
      wrapperClassName,
      color,
      nameKey,
      labelKey,
      ...props
    },
    ref
  ) => {
    const tooltipConfig = React.useContext(ChartContext)?.config

    const indicatorColor = color || payload?.[0]?.color

    if (
      active &&
      payload &&
      payload.length &&
      indicator !== "none" &&
      !hideIndicator
    ) {
      return (
        <div
          ref={ref}
          className={cn(
            "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
            wrapperClassName
          )}
          {...props}
        >
          {!hideLabel && (
            <div className={cn("font-medium", labelClassName)}>
              {labelFormatter?.(label, payload) ?? label}
            </div>
          )}
          <div className="grid gap-1.5">
            {payload.map((item, index) => {
              const key = `${nameKey || item.dataKey || item.name || index}`
              const itemConfig = getPayloadConfigFromPayload(tooltipConfig, item, key)
              const indicatorColor = color || item.color

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center"
                  )}
                >
                  {formatter &&
                  item.value !== undefined &&
                  item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "my-0.5": indicator === "line",
                                "my-1": indicator === "dashed",
                                "my-0.5 w-0.5": indicator === "dashed"
                              }
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor
                              }
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          "text-muted-foreground"
                        )}
                      >
                        <div className={cn("grid gap-1.5")}>
                          {itemConfig?.label ? (
                            <span className="label">
                              {itemConfig.label}
                            </span>
                          ) : (
                            <span className="label">
                              {item.name}
                            </span>
                          )}
                          {itemConfig?.label && (
                            <span className="description">
                              {itemConfig.label}
                            </span>
                          )}
                        </div>
                        {item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return null
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef(
  (
    { payload, nameKey, hideIcon = false, indicator = "dot", className, ...props },
    ref
  ) => {
    const tooltipConfig = React.useContext(ChartContext)?.config

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          className
        )}
        {...props}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(tooltipConfig, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-[2px]",
                    indicator === "dot" && "rounded-full",
                    indicator === "line" && "h-0.5 w-2",
                    indicator === "dashed" && "h-0.5 w-2 border-t border-dashed"
                  )}
                  style={{
                    backgroundColor: item.color
                  }}
                />
              )}
              <span className="text-muted-foreground">
                {itemConfig?.label}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey = key

  if (
    key in payload &&
    typeof payload[key] === "string"
  ) {
    configLabelKey = payload[key]
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key]
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle
}
