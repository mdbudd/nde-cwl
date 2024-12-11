import { RESTDataSource } from "@apollo/datasource-rest"
import { codes } from "../constants/weather"

export class PlacesAPI extends RESTDataSource {
  override baseURL = "https://geocoding-api.open-meteo.com/v1/"

  async getPlace(name = "Berlin", limit = "10") {
    const data = await this.get("search", {
      params: {
        name,
        count: limit.toString(), // all params entries should be strings,
        format: "json",
      },
    })

    return data.results
  }
}

export class WeatherAPI extends RESTDataSource {
  override baseURL = "https://api.open-meteo.com/v1/"

  async getWeather(
    latitude = "52.52",
    longitude = "13.41",
    daily = "weather_code,temperature_2m_max,wind_speed_10m_max",
    timezone = "Europe/London",
    temperature_unit = "celsius",
    wind_speed_unit = "mph",
  ) {
    const data = await this.get("forecast", {
      params: {
        latitude, // all params entries should be strings,
        longitude,
        daily,
        timezone,
        temperature_unit,
        wind_speed_unit,
      },
    })
    let dailyData = []
    const {
      time,
      weather_code: weatherCode,
      temperature_2m_max: temp,
      wind_speed_10m_max: wind,
    } = data.daily
    const { temperature_2m_max: tempUnit, wind_speed_10m_max: windUnit } = data.daily_units

    for (let i = 0; i < time.length; i++) {
      var date = new Date(time[i])
      const day = date.getDay()
      const code = codes.filter((codeItem) => weatherCode[i] === codeItem.id)[0]
      dailyData.push({
        date: date.toISOString(),
        day,
        temperature: temp[i],
        wind_speed: wind[i],
        icon: code.attributes.icon,
        description: code.attributes.description,
      })
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      temp_unit: tempUnit,
      wind_unit: windUnit,
      daily: dailyData,
    }
  }
}
