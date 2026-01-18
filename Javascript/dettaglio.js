const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let nome;
let latitudine;
let longitudine;

const titolo= document.getElementById("titolo")
const temperatura= document.getElementById("temperaturaAttuale")
const vento= document.getElementById("ventoAttuale")
const orarioRilevazione= document.getElementById("orarioRilevazione")
const tabella= document.getElementById("tabella")
const nome_finesta=document.getElementById("titolo_pagina")


/**
 * Funzione che legge i parametri dal URL
 */
function leggiParametri(){
    nome= urlParams.get("nome")
    latitudine= urlParams.get("lat")
    longitudine = urlParams.get("lon")
}

/**
 * Funzione che effettua la richiesta dei dati del meteo alla API Open-meteo
 * @returns L'array contenente i dati
 * @async
 */
async function richiestaMeteo() {
    const urlMeteo="https://api.open-meteo.com/v1/forecast?"
    const urlNuovo= urlMeteo+"latitude="+latitudine+"&longitude="+longitudine+"&current=temperature_2m,wind_speed_10m&timezone=auto&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
    const risposta= await fetch(urlNuovo)
    const risposta_meteo=await risposta.json()

    return risposta_meteo;
}


/**
 * Funzione che aggiona i dati della pagina con i dati meteo corretti
 * @async
 */
async function aggiornaDati() {
    leggiParametri();
    
    const dati_meteo = await richiestaMeteo()

    console.log(dati_meteo)

    temperatura.innerHTML+= dati_meteo.current.temperature_2m
    vento.innerHTML+=dati_meteo.current.wind_speed_10m
    orario= new Date(dati_meteo.current.time)
    orarioRilevazione.innerHTML+="Il giorno "+orario.getDate()+"/"+( orario.getMonth()+1 != 13?orario.getMonth()+1: orario.getMonth())+"/"+orario.getFullYear()+" alle ore ";
    orarioRilevazione.innerHTML+=orario.getHours()+":"+orario.getMinutes()+":"+orario.getSeconds();
}

/**
 * Funzione che aggiuge un riga alla tabella
 * @param {Array<String>} datiGiornalieri 
 */
function creaRigaTabella(datiGiornalieri){
    const riga= document.createElement("tr")

    for (dato of datiGiornalieri){
        const colonna= document.createElement("th")
        colonna.innerHTML=dato
        riga.append(colonna)
    }

    tabella.append(riga)
}


/**
 * Funzione che aggiorna la tabella con i dati meteo corretti
 * @async
 */
async function aggiornaTabella(){
    const dati_meteo= await richiestaMeteo();
    const dati_meteo_giornalieri = dati_meteo.daily

    for (let i=0; i<7; i++){
        const data=new Date(dati_meteo_giornalieri.time[i])
        const dataNumerica=data.getDate()+"/"+( data.getMonth()+1 != 13?data.getMonth()+1: data.getMonth())+"/"+data.getFullYear()
        creaRigaTabella([dataNumerica, dati_meteo_giornalieri.temperature_2m_max[i], dati_meteo_giornalieri.temperature_2m_min[i], dati_meteo_giornalieri.precipitation_sum[i]])
    }
}

/**
 * Event Listener che imposta il titolo corretto, e aggiorna i dati
 */
document.addEventListener("DOMContentLoaded", function(){
    titolo.innerHTML="3DMeteo: "+nome
    nome_finesta.innerHTML+=nome
    
    aggiornaDati().then()
    aggiornaTabella().then()
})
