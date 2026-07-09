import axios from 'axios'

const KEY = 'a3594b6ca666b21e0cae51fbfb3ccf76'

// 武汉市
const CITY_CODE = '420115'

export function getWeather() {

  return axios.get(
    'https://restapi.amap.com/v3/weather/weatherInfo',
    {
      params: {
        city: CITY_CODE,
        key: KEY,
        extensions: 'base'
      }
    }
  )
}