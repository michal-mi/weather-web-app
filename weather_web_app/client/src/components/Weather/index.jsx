import styles from "./styles.module.css"
import axios from "axios"
import { useState, useEffect } from "react"
import CanvasJSReact from '../../canvasjs.react'
import { Link } from "react-router-dom"
import exportFromJSON from 'export-from-json'

var convert = require("xml-js");

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Main = () => {
    const [error, setError] = useState("")
    const [weatherCityValues, setWeatherCityValues] = useState([])
    const [weatherCity2Values, setWeatherCity2Values] = useState([])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [city, setCity] = useState("")
    const [city2, setCity2] = useState("")
    const [cityName, setCityName] = useState("")
    const [city2Name, setCity2Name] = useState("")
    const [collapseTemperature, setCollapseTemperature] = useState(false)
    const [collapseHumidity, setCollapseHumidity] = useState(false)
    const [collapsePrecip, setCollapsePrecip] = useState(false)
    const [collapseWspd, setCollapseWspd] = useState(false)
    const [collapseSlp, setCollapseSlp] = useState(false)
    const [showButtons, setShowButtons] = useState(false)

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("user_id")
        window.location.href = "/"
    }

    const handleSubmit = async (e) => {
        setError("")
        e.preventDefault()
        var d1 = new Date(startDate.target.value)
        var d2 = new Date(endDate.target.value)
        var td = new Date()
        d1.setHours(0)
        d2.setHours(0)
        if (d1 >= d2) {
            setError("Data początkowa nie może być późniejsza lub równa dacie końcowej!")
        } else {
            if (d1 > td || d2 > td) {
                setError("Data początkowa i końcowa nie może być późniejsza niż data dzisiejsza!")
            }
        }

        const format = "json";
        const api = "5NK67DUVBAKMBQPZ53NVNRQFV";
        var allSavedWeather = await axios.get("http://localhost:8080/api/weathers", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
        var length = getLength(allSavedWeather.data)
        var isDataInDatabase = false
        for (var i = 0; i < length; i++) {
            if (allSavedWeather.data[i].city1 === city.target.value &&
                allSavedWeather.data[i].city2 === city2.target.value &&
                allSavedWeather.data[i].begDate === startDate.target.value &&
                allSavedWeather.data[i].endDate === endDate.target.value) {
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
                setShowButtons(true)
                console.log("Dane znalezione w bazie danych. Dane zostały pobrane z bazy danych.")
            }
        }
        //pobranie danych z API i zapis do bazy danych:
        if (isDataInDatabase === false) {
            try {
                const url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/history?&aggregateHours=24&" +
                    "startDateTime=" + startDate.target.value + "T00:00:00&endDateTime=" + endDate.target.value + "T00:00:00&unitGroup=uk&contentType=" + format + "&" +
                    "dayStartTime=0:0:00&dayEndTime=0:0:00&location=" + city.target.value + "&key=" + api;

                const url2 = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/history?&aggregateHours=24&" +
                    "startDateTime=" + startDate.target.value + "T00:00:00&endDateTime=" + endDate.target.value + "T00:00:00&unitGroup=uk&contentType=" + format + "&" +
                    "dayStartTime=0:0:00&dayEndTime=0:0:00&location=" + city2.target.value + "&key=" + api;

                console.log(url)

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
                setShowButtons(true)
                weather.city1 = city.target.value
                weather.city2 = city2.target.value
                weather.date = ""
                weather.begDate = startDate.target.value
                weather.endDate = endDate.target.value
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
            date: "",
            begDate: startDate.target.value,
            endDate: endDate.target.value,
            dateOfSearch: new Date()
        }
        console.log(history)
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

    //wyznaczenie liczby elementów obiektu weatherCityValues (czyli liczby dni):
    function getNumberOfDays() {
        var count = 0
        for (var prop in weatherCityValues) {
            if (weatherCityValues.hasOwnProperty(prop))
                count += 1;
        }
        return count
    }

    const downloadFile = ({ data, fileName, fileType }) => {
        // Create a blob with the data we want to download as a file
        const blob = new Blob([data], { type: fileType })
        // Create an anchor element and dispatch a click event on it
        // to trigger a download
        const a = document.createElement('a')
        a.download = fileName
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
    }

    function getData() {
        var expJSON = "["

        for (var i = 0; i < getNumberOfDays(); i++) {
            var obj1 = weatherCityValues[i]
            obj1.city = cityName
            expJSON += JSON.stringify(obj1) + ","
        }

        for (var j = 0; j < getNumberOfDays(); j++) {
            var obj2 = weatherCity2Values[j]
            obj2.city = city2Name
            expJSON += JSON.stringify(obj2) + ", "
            if (j + 1 === getNumberOfDays()) {
                expJSON += JSON.stringify(obj2)
            }
        }
        expJSON += "]"

        return expJSON
    }

    //eksport JSON
    const exportJSON = () => {

        var expJSON = getData()

        downloadFile({
            data: expJSON,
            fileName: 'weather.json',
            fileType: 'text/json',
        })
    }

    //eksport XML
    const exportXML = () => {

        var data = JSON.parse(getData())
        const fileName = 'weather'
        const exportType = 'xml'

        exportFromJSON({ data, fileName, exportType })
    }

    function displayTemperature() {
        if (weatherCityValues[0] !== undefined && weatherCity2Values[0] !== undefined) {
            var tempArrCity = [] //tablica przechowująca temperaturę w mieście 1
            var tempArrCity2 = [] //tablica przechowująca temperaturę w mieście 2
            //zapisanie danych o temperaturze w obu miastach na przestrzeni dni do tablic:
            for (var i = 0; i < getNumberOfDays(); i++) {
                tempArrCity[i] = { y: weatherCityValues[i].temp, label: weatherCityValues[i].datetimeStr.slice(0, 10) }
                tempArrCity2[i] = { y: weatherCity2Values[i].temp, label: weatherCity2Values[i].datetimeStr.slice(0, 10) }
            }
            const options = {
                animationEnabled: true,
                title: {
                    text: "Porównanie temperatury między " + cityName + " i " + city2Name
                },
                axisY: {
                    title: "Temperatura [°C]"
                },
                axisX: {
                    title: "Data"
                },
                toolTip: {
                    shared: true
                },
                data: [{
                    type: "spline",
                    name: cityName,
                    showInLegend: true,
                    dataPoints: tempArrCity
                },
                {
                    type: "spline",
                    name: city2Name,
                    showInLegend: true,
                    dataPoints: tempArrCity2
                }]
            }
            return (
                <div>
                    <CanvasJSChart options={options} />
                </div>
            );
        }
    }

    function displayHumidity() {
        if (weatherCityValues[0] !== undefined && weatherCity2Values[0] !== undefined) {
            var humArrCity = [] //tablica przechowująca ciśnienie w mieście 1
            var humArrCity2 = [] //tablica przechowująca ciśnienie w mieście 2
            //zapisanie danych o ciśnieniu w obu miastach na przestrzeni dni do tablic:
            for (var i = 0; i < getNumberOfDays(); i++) {
                humArrCity[i] = { y: weatherCityValues[i].humidity, label: weatherCityValues[i].datetimeStr.slice(0, 10) }
                humArrCity2[i] = { y: weatherCity2Values[i].humidity, label: weatherCity2Values[i].datetimeStr.slice(0, 10) }
            }
            const options = {
                animationEnabled: true,
                title: {
                    text: "Porównanie wilgotności między " + cityName + " i " + city2Name
                },
                axisY: {
                    title: "Wilgotność [%]"
                },
                axisX: {
                    title: "Data"
                },
                toolTip: {
                    shared: true
                },
                data: [{
                    type: "spline",
                    name: cityName,
                    showInLegend: true,
                    dataPoints: humArrCity
                },
                {
                    type: "spline",
                    name: city2Name,
                    showInLegend: true,
                    dataPoints: humArrCity2
                }]
            }
            return (
                <div>
                    <CanvasJSChart options={options} />
                </div>
            );
        }
    }

    function displayPrecip() {
        if (weatherCityValues[0] !== undefined && weatherCity2Values[0] !== undefined) {
            var precipArrCity = [] //tablica przechowująca opad w mieście 1
            var precipArrCity2 = [] //tablica przechowująca opad w mieście 2
            //zapisanie danych o opadzie w obu miastach na przestrzeni dni do tablic:
            for (var i = 0; i < getNumberOfDays(); i++) {
                precipArrCity[i] = { y: weatherCityValues[i].precip, label: weatherCityValues[i].datetimeStr.slice(0, 10) }
                precipArrCity2[i] = { y: weatherCity2Values[i].precip, label: weatherCity2Values[i].datetimeStr.slice(0, 10) }
            }
            const options = {
                animationEnabled: true,
                title: {
                    text: "Porównanie opadu między " + cityName + " i " + city2Name
                },
                axisY: {
                    title: "Opad [mm]"
                },
                axisX: {
                    title: "Data"
                },
                toolTip: {
                    shared: true
                },
                data: [{
                    type: "spline",
                    name: cityName,
                    showInLegend: true,
                    dataPoints: precipArrCity
                },
                {
                    type: "spline",
                    name: city2Name,
                    showInLegend: true,
                    dataPoints: precipArrCity2
                }]
            }
            return (
                <div>
                    <CanvasJSChart options={options} />
                </div>
            );
        }
    }

    function displayWspd() {
        if (weatherCityValues[0] !== undefined && weatherCity2Values[0] !== undefined) {
            var wspdArrCity = [] //tablica przechowująca prędkość wiatru w mieście 1
            var wspdArrCity2 = [] //tablica przechowująca prędkość wiatru w mieście 2
            //zapisanie danych o prędkości wiatru w obu miastach na przestrzeni dni do tablic:
            for (var i = 0; i < getNumberOfDays(); i++) {
                wspdArrCity[i] = { y: weatherCityValues[i].wspd, label: weatherCityValues[i].datetimeStr.slice(0, 10) }
                wspdArrCity2[i] = { y: weatherCity2Values[i].wspd, label: weatherCity2Values[i].datetimeStr.slice(0, 10) }
            }
            const options = {
                animationEnabled: true,
                title: {
                    text: "Porównanie prędkości wiatru między " + cityName + " i " + city2Name
                },
                axisY: {
                    title: "Prędkość wiatru [mph]"
                },
                axisX: {
                    title: "Data"
                },
                toolTip: {
                    shared: true
                },
                data: [{
                    type: "spline",
                    name: cityName,
                    showInLegend: true,
                    dataPoints: wspdArrCity
                },
                {
                    type: "spline",
                    name: city2Name,
                    showInLegend: true,
                    dataPoints: wspdArrCity2
                }]
            }
            return (
                <div>
                    <CanvasJSChart options={options} />
                </div>
            );
        }
    }

    function displaySlp() {
        if (weatherCityValues[0] !== undefined && weatherCity2Values[0] !== undefined) {
            var slpArrCity = [] //tablica przechowująca ciśnienie w mieście 1
            var slpArrCity2 = [] //tablica przechowująca ciśnienie wiatru w mieście 2
            //zapisanie danych o ciśnieniu w obu miastach na przestrzeni dni do tablic:
            for (var i = 0; i < getNumberOfDays(); i++) {
                slpArrCity[i] = { y: weatherCityValues[i].sealevelpressure, label: weatherCityValues[i].datetimeStr.slice(0, 10) }
                slpArrCity2[i] = { y: weatherCity2Values[i].sealevelpressure, label: weatherCity2Values[i].datetimeStr.slice(0, 10) }
            }
            const options = {
                animationEnabled: true,
                title: {
                    text: "Porównanie ciśnienia między " + cityName + " i " + city2Name
                },
                axisY: {
                    title: "Ciśnienie [mb]"
                },
                axisX: {
                    title: "Data"
                },
                toolTip: {
                    shared: true
                },
                data: [{
                    type: "spline",
                    name: cityName,
                    showInLegend: true,
                    dataPoints: slpArrCity
                },
                {
                    type: "spline",
                    name: city2Name,
                    showInLegend: true,
                    dataPoints: slpArrCity2
                }]
            }
            return (
                <div>
                    <CanvasJSChart options={options} />
                </div>
            );
        }
    }

    useEffect(() => {
        // console.log(weatherCityValues)
        // console.log(weatherCity2Values)
    })

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>Porównywanie miast</h1>
                <Link to="/">
                    <button className={styles.white_btn}>
                        Strona główna
                    </button>
                </Link>

                <button className={styles.white_btn} onClick={handleLogout}>
                    Wyloguj się
                </button>
            </nav>
            <h3 className={styles.center}>Porównywanie miast pod względem warunków atmosferycznych w zakresie czasowym</h3>
            <form className={styles.form_container} onSubmit={handleSubmit}>
                <div className={styles.section1}>
                    <div className={styles.center}>
                        <div className={styles.special}>Data początkowa:</div>
                        <input
                            type="date"
                            name="startDate"
                            onChange={e => setStartDate(e)}
                            className={styles.input1}
                            required
                        />
                    </div>
                    <div className={styles.center}>
                        <div className={styles.special}>Data końcowa:</div>
                        <input
                            type="date"
                            name="endDate"
                            onChange={e => setEndDate(e)}
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

            {showButtons === true && new Date(startDate.target.value) <= new Date(endDate.target.value) && new Date(startDate.target.value) < new Date() && error === "" ?
                <div>
                    <div className={styles.center}>
                        <button className={styles.green_btn} onClick={() => {
                            if (collapseTemperature === false) {
                                setCollapseTemperature(true)
                            } else {
                                setCollapseTemperature(false)
                            }
                        }}>
                            Pokaż / schowaj wykres temperatury
                        </button>
                    </div>
                    {collapseTemperature === true ?
                        displayTemperature()
                        :
                        null}
                    <div>
                        <div className={styles.center}>
                            <button className={styles.green_btn} onClick={() => {
                                if (collapseHumidity === false) {
                                    setCollapseHumidity(true)
                                } else {
                                    setCollapseHumidity(false)
                                }
                            }}>
                                Pokaż / schowaj wykres wilgotności
                            </button>
                        </div>
                    </div>
                    {collapseHumidity === true ?
                        displayHumidity()
                        :
                        null}
                    <div>
                        <div className={styles.center}>
                            <button className={styles.green_btn} onClick={() => {
                                if (collapsePrecip === false) {
                                    setCollapsePrecip(true)
                                } else {
                                    setCollapsePrecip(false)
                                }
                            }}>
                                Pokaż / schowaj wykres opadu
                            </button>
                        </div>
                    </div>
                    {collapsePrecip === true ?
                        displayPrecip()
                        :
                        null}
                    <div>
                        <div className={styles.center}>
                            <button className={styles.green_btn} onClick={() => {
                                if (collapseWspd === false) {
                                    setCollapseWspd(true)
                                } else {
                                    setCollapseWspd(false)
                                }
                            }}>
                                Pokaż / schowaj wykres prędkości wiatru
                            </button>
                        </div>
                    </div>
                    {collapseWspd === true ?
                        displayWspd()
                        :
                        null}
                    <div>
                        <div className={styles.center}>
                            <button className={styles.green_btn} onClick={() => {
                                if (collapseSlp === false) {
                                    setCollapseSlp(true)
                                } else {
                                    setCollapseSlp(false)
                                }
                            }}>
                                Pokaż / schowaj wykres ciśnienia
                            </button>
                        </div>
                    </div>
                    {collapseSlp === true ?
                        displaySlp()
                        :
                        null}
                    <div>
                        <div className={styles.center}>
                            <button className={styles.green_btn} onClick={exportJSON}>Wyeksportuj dane miast do pliku JSON</button>

                            <button className={styles.green_btn} onClick={exportXML}>Wyeksportuj dane miast do pliku XML</button>
                        </div>
                    </div>
                </div> :
                null
            }
            <div>
            </div>
        </div>
    )
}

export default Main