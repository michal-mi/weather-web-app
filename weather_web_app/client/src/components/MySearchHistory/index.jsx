import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import axios from "axios";
import { useEffect, useState } from "react";

export default function ShowReservations() {
    const [searchHistory, setSearchHistory] = useState([])

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("user_id")
        window.location.href = "/"
    }

    const deleteEntryInSearchHistory = async (id) => {
        axios.delete(`http://localhost:8080/api/histories/${id}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
        window.location.reload(true);
    }

    const deleteUserSearchHistory = async () => {
        axios.delete(`http://localhost:8080/api/histories/deleteAll/` + sessionStorage.getItem("user_id"), { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
        window.location.reload(true);
    }

    useEffect(() => {
        axios.get("http://localhost:8080/api/histories/user/" + sessionStorage.getItem("user_id"), { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }).then((userSearchHistory) => {
            setSearchHistory(userSearchHistory.data)
        })
    }, [])

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>Moja historia wyszukiwania</h1>
                <Link to="/">
                    <button type="button"
                        className={styles.white_btn}>
                        Strona główna
                    </button>
                </Link>
                <button className={styles.white_btn} onClick={handleLogout}>
                    Wyloguj się
                </button>
            </nav>

            <div class={styles.center}>
                <table class={styles.styledtable}>
                    <thead>
                        <tr>
                            <th>Data wyszukania</th>
                            <th>Miasto 1</th>
                            <th>Miasto 2</th>
                            <th>Data porównywanej pogody</th>
                            <th>Podczątek porównywanej pogody</th>
                            <th>Koniec porównywanej pogody</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            searchHistory.map((entry, key) => (
                                entry.date === null ?
                                    <tr entry={styles.activerow} key={key}>
                                        <td>{entry.dateOfSearch.slice(0,10)} {entry.dateOfSearch.slice(11,19)}</td>
                                        <td>{entry.city1}</td>
                                        <td>{entry.city2}</td>
                                        <td>{entry.date}</td>
                                        <td>{entry.begDate.slice(0, 10)}</td>
                                        <td>{entry.endDate.slice(0, 10)}</td>
                                        <td>
                                            <button
                                                className={styles.delete_btn} onClick={() => {
                                                    const confirmBox = window.confirm(
                                                        "Wpis zostanie bezwrotnie usunięty z historii. Kontynować?"
                                                    )
                                                    if (confirmBox === true) {
                                                        deleteEntryInSearchHistory(entry._id)
                                                    }
                                                }
                                                }>
                                                Usuń
                                            </button>
                                        </td>
                                    </tr>
                                    :
                                    <tr entry={styles.activerow} key={key}>
                                        <td>{entry.dateOfSearch.slice(0,10)} {entry.dateOfSearch.slice(11,19)}</td>
                                        <td>{entry.city1}</td>
                                        <td>{entry.city2}</td>
                                        <td>{entry.date.slice(0, 10)}</td>
                                        <td>{entry.begDate}</td>
                                        <td>{entry.endDate}</td>
                                        <td>
                                            <button
                                                className={styles.delete_btn} onClick={() => {
                                                    const confirmBox = window.confirm(
                                                        "Wpis zostanie bezwrotnie usunięty z historii. Kontynować?"
                                                    )
                                                    if (confirmBox === true) {
                                                        deleteEntryInSearchHistory(entry._id)
                                                    }
                                                }
                                                }>
                                                Usuń
                                            </button>
                                        </td>
                                    </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <div className={styles.center}>
            <button
                className={styles.red_btn} onClick={() => {
                    if(searchHistory.data === []){
                        const confirmBox = window.alert(
                            "Brak wpisów które mogłyby zostać usunięte. Najpierw dodaj wpisy!"
                        )  
                    } else {
                    const confirmBox = window.confirm(
                        "Wszystkie wpisy z historii zostaną bezpowrotnie usunięte. Kontynować?"
                    )
                    if (confirmBox === true) {
                        deleteUserSearchHistory()
                    }
                }
                }
                }>
                Usuń wszystkie wpisy
            </button>
            </div>
        </div>
    )
}