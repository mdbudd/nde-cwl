const attributes = [
  { description: "Clear sky", icon: "clear" },
  {
    description: "Mainly clear, partly cloudy, and overcast",
    icon: "part_cloud",
  },
  { description: "Fog and depositing rime fog", icon: "fog" },
  {
    description: "Drizzle: Light, moderate, and dense intensity",
    icon: "drizzle",
  },
  {
    description: "Freezing Drizzle: Light and dense intensity",
    icon: "freezing_drizzle",
  },
  {
    description: "Rain: Slight, moderate and heavy intensity",
    icon: "rain_slight",
  },
  {
    description: "Freezing Rain: Light and heavy intensity",
    icon: "freezing_rain",
  },
  {
    description: "Snow fall: Slight, moderate, and heavy intensity",
    icon: "snow",
  },
  { description: "Snow grains", icon: "slight_snow" },
  {
    description: "Rain showers: Slight, moderate, and violent",
    icon: "showers",
  },
  {
    description: "Snow showers slight and heavy",
    icon: "snow_showers",
  },
  {
    description: "Thunderstorm: Slight or moderate",
    icon: "thunder",
  },
  {
    description: "Thunderstorm with slight and heavy hail",
    icon: "thunder_rain",
  },
]
// TODO: This can be consolidated and consumed differently..
export const codes = [
  { id: 0, attributes: attributes[0] },
  { id: 1, attributes: attributes[1] },
  { id: 2, attributes: attributes[1] },
  { id: 3, attributes: attributes[1] },
  { id: 45, attributes: attributes[2] },
  { id: 48, attributes: attributes[2] },
  { id: 51, attributes: attributes[3] },
  { id: 53, attributes: attributes[3] },
  { id: 55, attributes: attributes[3] },
  { id: 56, attributes: attributes[4] },
  { id: 57, attributes: attributes[4] },
  { id: 61, attributes: attributes[5] },
  { id: 63, attributes: attributes[5] },
  { id: 65, attributes: attributes[5] },
  { id: 66, attributes: attributes[6] },
  { id: 67, attributes: attributes[6] },
  { id: 71, attributes: attributes[7] },
  { id: 73, attributes: attributes[7] },
  { id: 75, attributes: attributes[7] },
  { id: 77, attributes: attributes[8] },
  { id: 80, attributes: attributes[9] },
  { id: 81, attributes: attributes[9] },
  { id: 82, attributes: attributes[9] },
  { id: 85, attributes: attributes[10] },
  { id: 86, attributes: attributes[10] },
  { id: 95, attributes: attributes[11] },
  { id: 96, attributes: attributes[12] },
  { id: 99, attributes: attributes[12] },
]
