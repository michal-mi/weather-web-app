import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import axios from "axios"
import { useEffect, useState } from "react"
import XMLParser from 'react-xml-parser'
import exportFromJSON from 'export-from-json'
var convert = require("xml-js");


const Main = () => {

    const [loggedUser, setLoggedUser] = useState()
    const [rolesList, setRolesList] = useState([])
    const [error, setError] = useState("")
    const [info, setInfo] = useState("")
    const token = sessionStorage.getItem('id_token');

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("user_id")
        window.location.href = "/"
    }

    function getLength(tempArray) {
        var count = 0
        for (var prop in tempArray) {
            if (tempArray.hasOwnProperty(prop))
                count += 1;
        }
        return count
    }

    const exportUsersJSON = async (e) => {
        var allUsers = await axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
        console.log(allUsers.data)
        const expJSON = JSON.stringify(allUsers.data)
        downloadFile({
            data: expJSON,
            fileName: 'users.json',
            fileType: 'text/json',
        })
    }

    const exportRolesJSON = async (e) => {
        var allRoles = await axios.get("http://localhost:8080/api/roles", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
        console.log(allRoles.data)
        const expJSON = JSON.stringify(allRoles.data)
        downloadFile({
            data: expJSON,
            fileName: 'roles.json',
            fileType: 'text/json',
        })
    }

    const exportUsersXML = async (e) => {
        var allUsers = await axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
        const data = allUsers.data
        const fileName = 'users'
        const exportType = 'xml'
        exportFromJSON({ data, fileName, exportType })
    }

    const exportRolesXML = async (e) => {
        var allRoles = await axios.get("http://localhost:8080/api/roles", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
        const data = allRoles.data
        const fileName = 'roles'
        const exportType = 'xml'
        exportFromJSON({ data, fileName, exportType })
    }

    const downloadFile = ({ data, fileName, fileType }) => {
        const blob = new Blob([data], { type: fileType })
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

    const importUsersJSON = async (e) => {
        setInfo("")
        setError("")
        const fileReader = new FileReader()
        fileReader.readAsText(e.target.files[0], "UTF-8")
        e.target.value = null
        fileReader.onload = async (e) => {
            try {
                const tempData = JSON.parse(e.target.result)
                var count = getLength(tempData)

                var allUsers = await axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
                var count1 = getLength(allUsers.data)
                var canAddUsers = true
                for (var i = 0; i < count; i++) {
                    for (var j = 0; j < count1; j++) {
                        if (tempData[i]._id === allUsers.data[j]._id || tempData[i].email === allUsers.data[j].email) {
                            canAddUsers = false
                        }
                    }
                }

                if (canAddUsers) {
                    for (var i = 0; i < count; i++) {
                        try {
                            var user = tempData[i]
                            const url = "http://localhost:8080/api/users/withRole"
                            const { data: res } = await axios.post(url, user, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })

                        } catch (error) {
                            if (
                                error.response &&
                                error.response.status >= 400 &&
                                error.response.status <= 500
                            ) {
                                setError(error.response.data.message)
                            }
                        }
                    }
                    setInfo("Zaimportowano pomyślnie użytkowników!")
                } else {
                    setError("Nie można dodać użytkowników. Conajmniej jeden z importowanych użytkowników istnieje!")
                }
            } catch (error) {
                setError("Nieprawidłowa zawartość pliku JSON")
            }
        }
    }

    const importUsersXML = async (e) => {
        setInfo("")
        setError("")
        e.preventDefault()
        try {
            var file = await e.target.files[0].text()
            e.target.value = null
            var xml = new XMLParser().parseFromString(file).children
            var count = getLength(xml[0].children)
            console.log(xml[0].children)
            var allUsers = await axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
            var count1 = getLength(allUsers.data)
            var canAddUsers = true
            for (var i = 0; i < count; i++) {
                for (var j = 0; j < count1; j++) {
                    if (xml[0].children[i].children[0].value === allUsers.data[j]._id || xml[0].children[i].children[3].value === allUsers.data[j].email) {
                        canAddUsers = false
                    }
                }
            }

            if (canAddUsers) {
                for (var i = 0; i < count; i++) {
                    const u1 = {
                        _id: xml[0].children[i].children[0].value,
                        firstName: xml[0].children[i].children[1].value,
                        lastName: xml[0].children[i].children[2].value,
                        email: xml[0].children[i].children[3].value,
                        password: xml[0].children[i].children[4].value,
                        phoneNumber: xml[0].children[i].children[5].value,
                        roleID: xml[0].children[i].children[6].value
                    }
                    try {
                        const url = "http://localhost:8080/api/users/withRole"
                        const { data: res } = await axios.post(url, u1, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
                        console.log(res.message)
                    } catch (error) {
                        if (
                            error.response &&
                            error.response.status >= 400 &&
                            error.response.status <= 500
                        ) {
                            setError(error.response.data.message)
                        }
                    }
                }
                setInfo("Zaimportowano pomyślnie użytkowników!")
            } else {
                setError("Nie można dodać użytkowników. Conajmniej jeden z importowanych użytkowników istnieje!")
            }
        } catch (e) {
            setError("Nieprawidłowa zawartość pliku XML")
        }
    }

    useEffect(() => {
        var user_id = sessionStorage.getItem("user_id")
        axios.get("http://localhost:8080/api/users/" + user_id, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }).then((user) => {
            setLoggedUser(user.data.roleID)
        })
        axios.get("http://localhost:8080/api/roles", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }).then((roles) => {
            setRolesList(roles.data)
        })
    }, [])

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>Strona główna</h1>
                <button className={styles.white_btn} onClick={handleLogout}>
                    Wyloguj się
                </button>
            </nav>

            <div class={styles.center}>
                <Link to="/weather">
                    <button type="button"
                        className={styles.green_btn}>
                        Porównaj miasta
                    </button>
                </Link>
            </div>
            <div class={styles.center}>
                <Link to="/stats">
                    <button type="button"
                        className={styles.green_btn}>
                        Analiza dnia
                    </button>
                </Link>
            </div>
            <div class={styles.center}>
                <Link to="/mySearchHistory">
                    <button type="button"
                        className={styles.green_btn}>
                        Historia wyszukiwań
                    </button>
                </Link>
            </div>
            {rolesList[0] !== undefined && loggedUser !== undefined ?
                loggedUser === rolesList[0]._id ?
                    <div className={styles.border}>
                        <h2 className={styles.center}>Panel administratora</h2>
                        <div class={styles.center}>
                            <Link to="/dataManager">
                                <button type="button"
                                    className={styles.green_btn}>
                                    Menedżer Zapisanych Danych
                                </button>
                            </Link>
                        </div>
                        <h3 className={styles.center}>Eksporty:</h3>
                        <div className={styles.center}>
                            <button onClick={exportUsersJSON} className={styles.sm_green_btn}>Eksport użytkowników - JSON</button>
                            <button onClick={exportRolesJSON} className={styles.sm_green_btn}>Eksport ról - JSON</button>
                            <button onClick={exportUsersXML} className={styles.sm_green_btn}>Eksport użytkowników - XML</button>
                            <button onClick={exportRolesXML} className={styles.sm_green_btn}>Eksport ról - XML</button>
                        </div>
                        <h3 className={styles.center}>Importy:</h3>
                        <div className={styles.center}>
                            <input
                                type="file"
                                id="imp1"
                                onChange={importUsersJSON}
                                className={styles.inputHidden}
                            />
                            <label for="imp1" className={styles.sm_green_btn}>Import użytkowników - JSON</label>
                            <input
                                type="file"
                                id="imp2"
                                onChange={importUsersXML}
                                className={styles.inputHidden}
                            />
                            <label for="imp2" className={styles.sm_green_btn}>Import użytkowników - XML</label>
                        </div>
                        {error !== "" ?
                            <div className={styles.error_msg}>{error}</div>
                            :
                            null
                        }
                        {info !== "" && error === "" ?
                            <div className={styles.info_msg}>{info}</div>
                            :
                            null
                        }
                    </div>
                    :
                    null
                :
                null
            }
        </div>
    )
}
export default Main