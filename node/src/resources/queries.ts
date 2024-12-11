export const queryTest = {
  query: `query TestQuery{
    hello
    places(name:"Bournemouth") {
        latitude
        longitude
        name
    }
    weather(latitude:17.97065,longitude:-76.76199) {
        latitude
        longitude
        temp_unit
        wind_unit
        daily {
            date
            wind_speed
            description
            icon
            temperature
        }
    }
}
`,
}
