import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, EyeOff } from "lucide-react";

interface GraphDataPoint {
  t_offset: number;
  score: number;
}

interface EmotionLayer {
  id: string;
  label: string;
  data: GraphDataPoint[];
  color: string;
  enabled: boolean;
}

interface EmotionTimelineGraphProps {
  layers: EmotionLayer[];
  runtime?: number;
  title?: string;
  height?: number;
  showControls?: boolean;
}

const EmotionTimelineGraph = ({ 
  layers, 
  runtime = 100, 
  title = "Emotion Timeline",
  height = 400,
  showControls = true 
}: EmotionTimelineGraphProps) => {
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(
    layers.reduce((acc, layer) => ({ ...acc, [layer.id]: layer.enabled }), {})
  );

  const toggleLayer = (layerId: string) => {
    setVisibleLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const exportGraph = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(title, 40, 60);

    // Draw graph visualization
    const padding = 60;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2 - 60;

    layers.forEach(layer => {
      if (!visibleLayers[layer.id] || !layer.data.length) return;

      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      layer.data.forEach((point, index) => {
        const x = padding + (point.t_offset / 100) * graphWidth;
        const y = canvas.height - padding - 30 - (point.score / 10) * graphHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });

    // Export
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-emotion-graph.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Merge and sort all data points for the graph
  const mergedData = (() => {
    const allPoints = new Map<number, Record<string, number>>();

    layers.forEach(layer => {
      if (!visibleLayers[layer.id]) return;

      layer.data.forEach(point => {
        const existing = allPoints.get(point.t_offset) || {};
        existing[layer.id] = point.score;
        allPoints.set(point.t_offset, existing);
      });
    });

    return Array.from(allPoints.entries())
      .map(([t_offset, scores]) => ({ t_offset, ...scores }))
      .sort((a, b) => a.t_offset - b.t_offset);
  })();

  const formatTime = (percent: number) => {
    if (!runtime) return `${percent}%`;
    const minutes = Math.floor((percent / 100) * runtime);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <Card className="p-3 bg-background/95 backdrop-blur-sm border-border">
        <p className="font-semibold text-sm mb-2">{formatTime(label)}</p>
        {payload.map((entry: any) => {
          const layer = layers.find(l => l.id === entry.dataKey);
          if (!layer) return null;

          return (
            <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: layer.color }}
              />
              <span className="text-muted-foreground">{layer.label}:</span>
              <span className="font-semibold">{entry.value?.toFixed(1)}/10</span>
            </div>
          );
        })}
      </Card>
    );
  };

  const hasData = layers.some(layer => visibleLayers[layer.id] && layer.data.length > 0);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Interactive emotion timeline visualization
          </p>
        </div>
        {showControls && (
          <Button
            variant="outline"
            size="sm"
            onClick={exportGraph}
            className="gap-2"
            disabled={!hasData}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>

      {showControls && (
        <div className="flex flex-wrap gap-2 mb-4">
          {layers.map(layer => (
            <Badge
              key={layer.id}
              variant={visibleLayers[layer.id] ? "default" : "outline"}
              className="cursor-pointer gap-2 px-3 py-1.5"
              style={{
                backgroundColor: visibleLayers[layer.id] ? layer.color : undefined,
                borderColor: layer.color,
                color: visibleLayers[layer.id] ? '#ffffff' : layer.color,
              }}
              onClick={() => toggleLayer(layer.id)}
            >
              {visibleLayers[layer.id] ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {layer.label}
              {layer.data.length > 0 && (
                <span className="text-xs opacity-80">({layer.data.length})</span>
              )}
            </Badge>
          ))}
        </div>
      )}

      {!hasData ? (
        <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-lg">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No emotion data available</p>
            <p className="text-sm text-muted-foreground">
              Enable a layer or add emotion data to see the graph
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={mergedData}>
            <defs>
              {layers.map(layer => (
                <linearGradient key={layer.id} id={`gradient-${layer.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={layer.color} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={layer.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.2}
              vertical={false}
            />
            
            <XAxis
              dataKey="t_offset"
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={formatTime}
              label={{ value: 'Runtime', position: 'insideBottom', offset: -5 }}
            />
            
            <YAxis
              domain={[0, 10]}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Emotion Score', angle: -90, position: 'insideLeft' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {layers.map(layer => (
              visibleLayers[layer.id] && layer.data.length > 0 && (
                <Area
                  key={layer.id}
                  type="monotone"
                  dataKey={layer.id}
                  stroke={layer.color}
                  strokeWidth={3}
                  fill={`url(#gradient-${layer.id})`}
                  name={layer.label}
                  connectNulls
                />
              )
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}

      {hasData && (
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Emotion Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {layers.map(layer => {
              if (!visibleLayers[layer.id] || !layer.data.length) return null;
              
              const scores = layer.data.map(d => d.score);
              const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
              const max = Math.max(...scores);
              const min = Math.min(...scores);

              return (
                <Card key={layer.id} className="p-4 bg-card/50 border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ 
                        backgroundColor: layer.color,
                        boxShadow: `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${layer.color}`
                      }}
                    />
                    <span className="font-semibold text-sm text-foreground">{layer.label}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average:</span>
                      <span className="font-bold text-foreground">{avg.toFixed(1)}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peak:</span>
                      <span className="font-semibold" style={{ color: layer.color }}>{max.toFixed(1)}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Low:</span>
                      <span className="font-semibold text-muted-foreground">{min.toFixed(1)}/10</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EmotionTimelineGraph;
