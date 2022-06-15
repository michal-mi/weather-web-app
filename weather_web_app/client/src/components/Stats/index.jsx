import styles from "./styles.module.css"
import axios from "axios"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesDown, faAnglesUp, faEquals } from '@fortawesome/free-solid-svg-icons'
import XMLParser from 'react-xml-parser'

const Stats = () => {
    const [error, setError] = useState("")
    const [weatherCityValues, setWeatherCityValues] = useState([])
    const [weatherCity2Values, setWeatherCity2Values] = useState([])
    const [date, setDate] = useState("")
    const [city, setCity] = useState("")
    const [city2, setCity2] = useState("")
    const [cityName, setCityName] = useState("")
    const [city2Name, setCity2Name] = useState("")
    const [isFileJSONClicked, setIsFileJSONClicked] = useState(false)
    const [isFileXMLClicked, setIsFileXMLClicked] = useState(false)

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("user_id")
        window.location.href = "/"
    }

    const handleSubmit = async (e) => {
        setIsFileJSONClicked(false)
        setIsFileXMLClicked(false)
        setError("")
        e.preventDefault()

        var d = new Date(date.target.value)
        var td = new Date()
        d.setHours(0)

        if (d > td) {
            setError("Data nie może być późniejsza od daty dzisiejszej!")
        }

        const format = "json";
        const api = "5NK67DUVBAKMBQPZ53NVNRQFV";


        var allSavedWeather = await axios.get("http://localhost:8080/api/weathers", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
        var length = getLength(allSavedWeather.data)
        var isDataInDatabase = false
        for (var i = 0; i < length; i++) {
            if (allSavedWeather.data[i].city1 === city.target.value &&
                allSavedWeather.data[i].city2 === city2.target.value &&
                allSavedWeather.data[i].date === date.target.value) {
                //pobranie danych z bazy danych i zapisanie do zmiennych lokalnych:
                isDataInDatabase = true
                setWeatherCityValues(weatherCityValues => ({
                    ...allSavedWeather.data[i].dataCity1
                }));
                setWeatherCity2Values(weatherCity2Values => ({
                    ...allSavedWeather.data[i].dataCity2
                }));
                setCityName(allSavedWeather.data[i].city1)
                setCity2Name(allSavedWeather.data[i].city2)
                // setShowButtons(true)
                console.log("Dane znalezione w bazie danych. Dane zostały pobrane z bazy danych.")
            }
        }
        //pobranie danych z API i zapis do bazy danych:
        if (isDataInDatabase === false) {
            try {

                const url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/history?&aggregateHours=24&" +
                    "startDateTime=" + date.target.value + "T00:00:00&endDateTime=" + date.target.value + "T00:00:00&unitGroup=uk&contentType=" + format + "&" +
                    "dayStartTime=0:0:00&dayEndTime=0:0:00&location=" + city.target.value + "&key=" + api;

                const url2 = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/history?&aggregateHours=24&" +
                    "startDateTime=" + date.target.value + "T00:00:00&endDateTime=" + date.target.value + "T00:00:00&unitGroup=uk&contentType=" + format + "&" +
                    "dayStartTime=0:0:00&dayEndTime=0:0:00&location=" + city2.target.value + "&key=" + api;

                console.log(url2)

                var weather = {
                    city1: "",
                    city2: "",
                    begDate: "",
                    endDate: "",
                    date: "",
                    dataCity1: "",
                    dataCity2: ""
                }

                await axios.get(url).then((allWeather) => {
                    const values = allWeather.data.locations[city.target.value].values
                    weather.dataCity1 = values
                    setWeatherCityValues(weatherCityValues => ({
                        ...values
                    }));
                })
                await axios.get(url2).then((allWeather) => {
                    const values = allWeather.data.locations[city2.target.value].values
                    weather.dataCity2 = values
                    setWeatherCity2Values(weatherCity2Values => ({
                        ...values
                    }));
                })
            } catch (error) {
                if (error.response && error.response.status >= 400 && error.response.status <= 500) {
                    setError(error.response.specifiedData.message)
                }
            } finally {
                setCityName(city.target.value)
                setCity2Name(city2.target.value)
                // setShowButtons(true)
                weather.city1 = city.target.value
                weather.city2 = city2.target.value
                weather.date = date.target.value
                const url = "http://localhost:8080/api/weathers"
                await axios.post(url, weather, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
                console.log("Dane nie znalezione w bazie danych. Dane pobrano z API i dodano do bazy danych.")
            }
        }
        //zapis danych do historii wyszukiwania użytkownika:
        var history = {
            userID: sessionStorage.getItem("user_id"),
            city1: city.target.value,
            city2: city2.target.value,
            date: date.target.value,
            begDate: "",
            endDate: "",
            dateOfSearch: new Date()
        }
        const url = "http://localhost:8080/api/histories"
        await axios.post(url, history, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
    }

    function getLength(tempArray) {
        var count = 0
        for (var prop in tempArray) {
            if (tempArray.hasOwnProperty(prop))
                count += 1;
        }
        return count
    }

    function getDescribeOfVisibility1() {
        if (weatherCityValues[0].visibility <= 0.1) return " (bardzo zła)"
        else if (weatherCityValues[0].visibility <= 0.3 && weatherCityValues[0].visibility > 0.1) return " (zła)"
        else if (weatherCityValues[0].visibility <= 0.5 && weatherCityValues[0].visibility > 0.3) return " (obniżona)"
        else if (weatherCityValues[0].visibility <= 2 && weatherCityValues[0].visibility > 0.5) return " (słaba)"
        else if (weatherCityValues[0].visibility <= 5 && weatherCityValues[0].visibility > 2) return " (umiarkowana)"
        else if (weatherCityValues[0].visibility <= 11 && weatherCityValues[0].visibility > 5) return " (dobra)"
        else if (weatherCityValues[0].visibility <= 28 && weatherCityValues[0].visibility > 11) return " (bardzo dobra)"
        else return " (doskonała)"
    }

    function getDescribeOfVisibility2() {
        if (weatherCity2Values[0].visibility <= 0.1) return " (bardzo zła)"
        else if (weatherCity2Values[0].visibility <= 0.3 && weatherCity2Values[0].visibility > 0.1) return " (zła)"
        else if (weatherCity2Values[0].visibility <= 0.5 && weatherCity2Values[0].visibility > 0.3) return " (obniżona)"
        else if (weatherCity2Values[0].visibility <= 2 && weatherCity2Values[0].visibility > 0.5) return " (słaba)"
        else if (weatherCity2Values[0].visibility <= 5 && weatherCity2Values[0].visibility > 2) return " (umiarkowana)"
        else if (weatherCity2Values[0].visibility <= 11 && weatherCity2Values[0].visibility > 5) return " (dobra)"
        else if (weatherCity2Values[0].visibility <= 28 && weatherCity2Values[0].visibility > 11) return " (bardzo dobra)"
        else return " (doskonała)"
    }

    function getDescribeOfCondition1() {
        const str = weatherCityValues[0].conditions.split(',')[0]

        switch (str) {
            case "Blowing Or Drifting Snow": return "Wiejący śnieg"
            case "Drizzle": return "Mżawka"
            case "Heavy Drizzle": return "Silna mżawka"
            case "Light Drizzle": return "Lekka mżawka"
            case "Heavy Drizzle/Rain": return "Silna mżawka/deszcz"
            case "Light Drizzle/Rain": return "Lekka mżawka/śnieg"
            case "Duststorm": return "Burza piaskowa"
            case "Fog": return "Mgła"
            case "Freezing Drizzle/Freezing Rain": return "Marznąca mżawka/deszcz"
            case "Heavy Freezing Drizzle/Freezing Rain": return "Silna marznąca mżawka/deszcz"
            case "Light Freezing Drizzle/Freezing Rain": return "Lekka marznąca mżawka/deszcz"
            case "Freezing Fog": return "Marznąca mgła"
            case "Heavy Freezing Rain": return "Silny marznący deszcz"
            case "Light Freezing Rain": return "Lekki marznący deszcz"
            case "Funnel Cloud/Tornado": return "Tornado"
            case "Hail Showers": return "Przelotne opady gradu"
            case "Ice": return "Lód"
            case "Lightning Without Thunder": return "Błyskawica"
            case "Mist": return "Mgła"
            case "Precipitation In Vicinity": return "Opady w pobliżu"
            case "Rain": return "Deszcz"
            case "Heavy Rain And Snow": return "Ulewny deszcz ze śniegiem"
            case "Light Rain And Snow": return "Lekki deszcz ze śniegiem"
            case "Rain Showers": return "Przelotny deszcz"
            case "Heavy Rain": return "Ulewny deszcz"
            case "Light Rain": return "Lekki deszcz"
            case "Sky Coverage Decreasing": return "Zachmurzenie zmniejszające się"
            case "Sky Coverage Increasing": return "Zachmurzenie zwiększające się"
            case "Sky Unchanged": return "Stałe zachmurzenie"
            case "Smoke Or Haze": return "Mgła"
            case "Snow": return "Śnieg"
            case "Snow And Rain Showers": return "Przelotne opady śniegu z deszczem"
            case "Snow Showers": return "Przelotne opady śniegu"
            case "Heavy Snow": return "Intensywny śnieg"
            case "Light Snow": return "Lekki śnieg"
            case "Squalls": return "Szkwał"
            case "Thunderstorm": return "Burza z piorunami"
            case "Thunderstorm Without Precipitation": return "Burza z piorunami bez opadów"
            case "Diamond Dust": return "Pył diamentowy"
            case "Hail": return "Grad"
            case "Overcast": return "Pochmurno"
            case "Partially cloudy": return "Częściowe zachmurzenie"
            case "Clear": return "Czyste niebo"
            default: return "brak danych"
        }
    }

    function getDescribeOfCondition2() {
        const str = weatherCity2Values[0].conditions.split(',')[0]

        switch (str) {
            case "Blowing Or Drifting Snow": return "Wiejący śnieg"
            case "Drizzle": return "Mżawka"
            case "Heavy Drizzle": return "Silna mżawka"
            case "Light Drizzle": return "Lekka mżawka"
            case "Heavy Drizzle/Rain": return "Silna mżawka/deszcz"
            case "Light Drizzle/Rain": return "Lekka mżawka/śnieg"
            case "Duststorm": return "Burza piaskowa"
            case "Fog": return "Mgła"
            case "Freezing Drizzle/Freezing Rain": return "Marznąca mżawka/deszcz"
            case "Heavy Freezing Drizzle/Freezing Rain": return "Silna marznąca mżawka/deszcz"
            case "Light Freezing Drizzle/Freezing Rain": return "Lekka marznąca mżawka/deszcz"
            case "Freezing Fog": return "Marznąca mgła"
            case "Heavy Freezing Rain": return "Silny marznący deszcz"
            case "Light Freezing Rain": return "Lekki marznący deszcz"
            case "Funnel Cloud/Tornado": return "Tornado"
            case "Hail Showers": return "Przelotne opady gradu"
            case "Ice": return "Lód"
            case "Lightning Without Thunder": return "Błyskawica"
            case "Mist": return "Mgła"
            case "Precipitation In Vicinity": return "Opady w pobliżu"
            case "Rain": return "Deszcz"
            case "Heavy Rain And Snow": return "Ulewny deszcz ze śniegiem"
            case "Light Rain And Snow": return "Lekki deszcz ze śniegiem"
            case "Rain Showers": return "Przelotny deszcz"
            case "Heavy Rain": return "Ulewny deszcz"
            case "Light Rain": return "Lekki deszcz"
            case "Sky Coverage Decreasing": return "Zachmurzenie zmniejszające się"
            case "Sky Coverage Increasing": return "Zachmurzenie zwiększające się"
            case "Sky Unchanged": return "Stałe zachmurzenie"
            case "Smoke Or Haze": return "Mgła"
            case "Snow": return "Śnieg"
            case "Snow And Rain Showers": return "Przelotne opady śniegu z deszczem"
            case "Snow Showers": return "Przelotne opady śniegu"
            case "Heavy Snow": return "Intensywny śnieg"
            case "Light Snow": return "Lekki śnieg"
            case "Squalls": return "Szkwał"
            case "Thunderstorm": return "Burza z piorunami"
            case "Thunderstorm Without Precipitation": return "Burza z piorunami bez opadów"
            case "Diamond Dust": return "Pył diamentowy"
            case "Hail": return "Grad"
            case "Overcast": return "Pochmurno"
            case "Partially cloudy": return "Częściowe zachmurzenie"
            case "Clear": return "Czyste niebo"
            default: return "brak danych"
        }
    }

    function compare(a, b) {
        a = parseFloat(a)
        b = parseFloat(b)
        if (a > b) return 1
        else if (a < b) return 0
        else return -1
    }

    const handleChangeJSON = e => {
        setError("")

        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        var obj
        fileReader.onload = e => {
            try {
                obj = JSON.parse(e.target.result)
                setWeatherCityValues([])
                setWeatherCity2Values([])
                const json1 = {
                    "0": obj[0]
                }
                const json2 = {
                    "0": obj[1]
                }

                setCityName(obj[0].city)
                setCity2Name(obj[1].city)
                setWeatherCityValues(json1)
                setWeatherCity2Values(json2)
            } catch (e) {
                setError("Nieprawidłowa zawartość pliku JSON")
            }
        }
        e.target.value = null
        setIsFileJSONClicked(true)
    }

    const handleChangeXML = async (e) => {
        setError("")
        e.preventDefault()

        try {
            var file = await e.target.files[0].text()
            var xml = new XMLParser().parseFromString(file).children;
            setWeatherCityValues([])
            setWeatherCity2Values([])

            const xml1 = {
                "0": {
                    conditions: xml[0].children[0].children[0].value,
                    temp: xml[0].children[0].children[1].value,
                    mint: xml[0].children[0].children[2].value,
                    maxt: xml[0].children[0].children[3].value,
                    wspd: xml[0].children[0].children[4].value,
                    wdir: xml[0].children[0].children[5].value,
                    cloudcover: xml[0].children[0].children[6].value,
                    precip: xml[0].children[0].children[7].value,
                    humidity: xml[0].children[0].children[8].value,
                    visibility: xml[0].children[0].children[9].value,
                    sealevelpressure: xml[0].children[0].children[10].value
                }
            }

            const xml2 = {
                "0": {
                    conditions: xml[0].children[1].children[0].value,
                    temp: xml[0].children[1].children[1].value,
                    mint: xml[0].children[1].children[2].value,
                    maxt: xml[0].children[1].children[3].value,
                    wspd: xml[0].children[1].children[4].value,
                    wdir: xml[0].children[1].children[5].value,
                    cloudcover: xml[0].children[1].children[6].value,
                    precip: xml[0].children[1].children[7].value,
                    humidity: xml[0].children[1].children[8].value,
                    visibility: xml[0].children[1].children[9].value,
                    sealevelpressure: xml[0].children[1].children[10].value
                }
            }
            console.log(xml1)
            console.log(xml2)
            console.log(xml)

            setWeatherCityValues(xml1)
            setWeatherCity2Values(xml2)
            setCityName(xml[0].children[0].children[11].value)
            setCity2Name(xml[0].children[1].children[11].value)
        } catch (e) {
            setError("Nieprawidłowa zawartość pliku XML")
        }

        e.target.value = null
        setIsFileXMLClicked(true)
    }

    useEffect(() => {
        // console.log(weatherCityValues[0])
        // console.log(weatherCity2Values[0])
    })

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>Analizowanie dnia</h1>
                <Link to="/">
                    <button className={styles.white_btn}>
                        Strona główna
                    </button>
                </Link>

                <button className={styles.white_btn} onClick={handleLogout}>
                    Wyloguj się
                </button>
            </nav>

            <h3 className={styles.center}>Zaimportuj dane z pliku</h3>
            <div className={styles.center}>
                <input type="file" onChange={handleChangeJSON} className={styles.inputHidden} id="json" />
                <label for="json" className={styles.green_btn}>Zaimportuj plik JSON</label>

                <input type="file" onChange={handleChangeXML} className={styles.inputHidden} id="xml" />
                <label for="xml" className={styles.green_btn}>Zaimportuj plik XML</label>
            </div>
            <h3 className={styles.center}>lub wykorzystaj formularz</h3>
            <form className={styles.form_container} onSubmit={handleSubmit}>
                <div className={styles.section1}>
                    <div className={styles.center}>
                        <div className={styles.special}>Data:</div>
                        <input
                            type="date"
                            name="startDate"
                            onChange={e => setDate(e)}
                            className={styles.input1}
                            required
                        />
                    </div>
                    <div className={styles.center}>
                        <div className={styles.special}>1. miasto:</div>
                        <input
                            type="text"
                            placeholder="Wpisz pierwsze miasto"
                            name="city"
                            onChange={e => setCity(e)}
                            className={styles.input1}
                            required
                        />
                    </div>
                    <div className={styles.center}>
                        <div className={styles.special}>2. miasto:</div>
                        <input
                            type="text"
                            placeholder="Wpisz drugie miasto"
                            name="city2"
                            onChange={e => setCity2(e)}
                            className={styles.input1}
                            required
                        />
                    </div>
                    <div className={styles.center}>
                        <button type="submit" className={styles.green_btn}> Wyświetl porównanie </button>
                    </div>
                </div>
                {error !== "" ?
                    <div className={styles.error_msg}>{error}</div>
                    :
                    null
                }
            </form>

            {weatherCityValues[0] !== undefined && weatherCity2Values[0] !== undefined && error === "" ?
                <div class={styles.center}>
                    <table class={styles.styledtable}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>{cityName}</th>
                                <th>{city2Name}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    Warunki pogodowe
                                </td>
                                <td>
                                    {getDescribeOfCondition1()}
                                </td>
                                <td>
                                    {getDescribeOfCondition2()}
                                </td>
                            </tr>

                            {compare(weatherCityValues[0].temp, weatherCity2Values[0].temp) === 0 ?
                                <tr>
                                    <td>
                                        Temperatura średnia
                                    </td>
                                    <td>
                                        {weatherCityValues[0].temp} °C
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].temp} °C
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].temp, weatherCity2Values[0].temp) === 1 ?
                                    <tr>
                                        <td>
                                            Temperatura średnia
                                        </td>
                                        <td>
                                            {weatherCityValues[0].temp} °C
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].temp} °C
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Temperatura średnia
                                        </td>
                                        <td>
                                            {weatherCityValues[0].temp} °C
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].temp} °C
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }

                            {compare(weatherCityValues[0].mint, weatherCity2Values[0].mint) === 0 ?
                                <tr>
                                    <td>
                                        Temperatura minimalna
                                    </td>
                                    <td>
                                        {weatherCityValues[0].mint} °C
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].mint} °C
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].mint, weatherCity2Values[0].mint) === 1 ?
                                    <tr>
                                        <td>
                                            Temperatura minimalna
                                        </td>
                                        <td>
                                            {weatherCityValues[0].mint} °C
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].mint} °C
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Temperatura minimalna
                                        </td>
                                        <td>
                                            {weatherCityValues[0].mint} °C
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].mint} °C
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }

                            {compare(weatherCityValues[0].maxt, weatherCity2Values[0].maxt) === 0 ?
                                <tr>
                                    <td>
                                        Temperatura maksymalna
                                    </td>
                                    <td>
                                        {weatherCityValues[0].maxt} °C
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].maxt} °C
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].maxt, weatherCity2Values[0].maxt) === 1 ?
                                    <tr>
                                        <td>
                                            Temperatura maksymalna
                                        </td>
                                        <td>
                                            {weatherCityValues[0].maxt} °C
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].maxt} °C
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Temperatura maksymalna
                                        </td>
                                        <td>
                                            {weatherCityValues[0].maxt} °C
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].maxt} °C
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }

                            {compare(weatherCityValues[0].wspd, weatherCity2Values[0].wspd) === 0 ?
                                <tr>
                                    <td>
                                        Prędkość wiatru
                                    </td>
                                    <td>
                                        {weatherCityValues[0].wspd} mph
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].wspd} mph
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].wspd, weatherCity2Values[0].wspd) === 1 ?
                                    <tr>
                                        <td>
                                            Prędkość wiatru
                                        </td>
                                        <td>
                                            {weatherCityValues[0].wspd} mph
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].wspd} mph
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Prędkość wiatru
                                        </td>
                                        <td>
                                            {weatherCityValues[0].wspd} mph
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].wspd} mph
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }

                            <tr>
                                <td>
                                    Kierunek wiatru
                                </td>
                                <td>
                                    {weatherCityValues[0].wdir} °
                                </td>
                                <td>
                                    {weatherCity2Values[0].wdir} °
                                </td>
                            </tr>

                            {compare(weatherCityValues[0].cloudcover, weatherCity2Values[0].cloudcover) === 0 ?
                                <tr>
                                    <td>
                                        Zachmurzenie
                                    </td>
                                    <td>
                                        {weatherCityValues[0].cloudcover} %
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].cloudcover} %
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].cloudcover, weatherCity2Values[0].cloudcover) === 1 ?
                                    <tr>
                                        <td>
                                            Zachmurzenie
                                        </td>
                                        <td>
                                            {weatherCityValues[0].cloudcover} %
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].cloudcover} %
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Zachmurzenie
                                        </td>
                                        <td>
                                            {weatherCityValues[0].cloudcover} %
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].cloudcover} %
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }

                            {compare(weatherCityValues[0].precip, weatherCity2Values[0].precip) === 0 ?
                                <tr>
                                    <td>
                                        Opady
                                    </td>
                                    <td>
                                        {weatherCityValues[0].precip} mm
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].precip} mm
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].precip, weatherCity2Values[0].precip) === 1 ?
                                    <tr>
                                        <td>
                                            Opady
                                        </td>
                                        <td>
                                            {weatherCityValues[0].precip} mm
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].precip} mm
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Opady
                                        </td>
                                        <td>
                                            {weatherCityValues[0].precip} mm
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].precip} mm
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }

                            {compare(weatherCityValues[0].humidity, weatherCity2Values[0].humidity) === 0 ?
                                <tr>
                                    <td>
                                        Wilgotność powietrza
                                    </td>
                                    <td>
                                        {weatherCityValues[0].humidity} %
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].humidity} %
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].humidity, weatherCity2Values[0].humidity) === 1 ?
                                    <tr>
                                        <td>
                                            Wilgotność powietrza
                                        </td>
                                        <td>
                                            {weatherCityValues[0].humidity} %
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].humidity} %
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Wilgotność powietrza
                                        </td>
                                        <td>
                                            {weatherCityValues[0].humidity} %
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].humidity} %
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }

                            {compare(weatherCityValues[0].visibility, weatherCity2Values[0].visibility) === 0 ?
                                <tr>
                                    <td>
                                        Widoczność
                                    </td>
                                    <td>
                                        {weatherCityValues[0].visibility}
                                        {getDescribeOfVisibility1()}
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].visibility}
                                        {getDescribeOfVisibility2()}
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].visibility, weatherCity2Values[0].visibility) === 1 ?
                                    <tr>
                                        <td>
                                            Widoczność
                                        </td>
                                        <td>
                                            {weatherCityValues[0].visibility}
                                            {getDescribeOfVisibility1()}
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].visibility}
                                            {getDescribeOfVisibility2()}
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Widoczność
                                        </td>
                                        <td>
                                            {weatherCityValues[0].visibility}
                                            {getDescribeOfVisibility1()}
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].visibility}
                                            {getDescribeOfVisibility2()}
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }

                            {compare(weatherCityValues[0].sealevelpressure, weatherCity2Values[0].sealevelpressure) === 0 ?
                                <tr>
                                    <td>
                                        Ciśnienie atmosferyczne
                                    </td>
                                    <td>
                                        {weatherCityValues[0].sealevelpressure} mb
                                        <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                    </td>
                                    <td>
                                        {weatherCity2Values[0].sealevelpressure} mb
                                        <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                    </td>
                                </tr>
                                : compare(weatherCityValues[0].sealevelpressure, weatherCity2Values[0].sealevelpressure) === 1 ?
                                    <tr>
                                        <td>
                                            Ciśnienie atmosferyczne
                                        </td>
                                        <td>
                                            {weatherCityValues[0].sealevelpressure} mb
                                            <FontAwesomeIcon icon={faAnglesUp} className={styles.icon_up} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].sealevelpressure} mb
                                            <FontAwesomeIcon icon={faAnglesDown} className={styles.icon_down} />
                                        </td>
                                    </tr>
                                    :
                                    <tr>
                                        <td>
                                            Ciśnienie atmosferyczne
                                        </td>
                                        <td>
                                            {weatherCityValues[0].sealevelpressure} mb
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                        <td>
                                            {weatherCity2Values[0].sealevelpressure} mb
                                            <FontAwesomeIcon icon={faEquals} className={styles.icon_eq} />
                                        </td>
                                    </tr>
                            }
                        </tbody>
                    </table>
                </div>
                : null}
        </div>
    )
}

export default Stats