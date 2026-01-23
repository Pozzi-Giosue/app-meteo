const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let nome;
let latitudine;
let longitudine;
let favorito=false;

const titolo= document.getElementById("titolo")
const temperatura= document.getElementById("temperaturaAttuale")
const vento= document.getElementById("ventoAttuale")
const orarioRilevazione= document.getElementById("orarioRilevazione")
const nome_finesta=document.getElementById("titolo_pagina")
const stella= document.getElementById("stella");

const alba_tramonto=document.getElementById("extraParam");
const giorni=document.getElementById("extraDays");
const t_head=document.getElementById("intestazioneTabella");
const t_body= document.getElementById("tabellaPrevisioni");

//GESTIONE RICHIESTE METEO 

/**
 * Funzione che legge i parametri dal URL
 */
function leggiParametri(){
    nome= urlParams.get("nome")
    latitudine= urlParams.get("lat")
    longitudine = urlParams.get("lon")

    let comunePref=localStorage.getItem("Preferito");

    if(comunePref){
        console.log(comunePref)
        favorito=comunePref.split(",")[0]==nome?true:false;
    }

    if (favorito) stella.src="../img/Stella_piena.png";
}

/**
 * Funzione che effettua la richiesta dei dati del meteo alla API Open-meteo
 * @returns L'array contenente i dati
 * @async
 * @throws Un errore di rete
 */
async function richiestaMeteo() {
    const urlMeteo="https://api.open-meteo.com/v1/forecast?"
    let urlNuovo= urlMeteo+"latitude="+latitudine+"&longitude="+longitudine+"&current=temperature_2m,wind_speed_10m&timezone=auto"
    urlNuovo+="&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,sunrise,sunset"
    urlNuovo+="&forecast_days="+giorni.value;

    const risposta= await fetch(urlNuovo)
    if (!risposta.ok) throw new Error("Errore di rete");

    const risposta_meteo=await risposta.json()
    return risposta_meteo;
}

/**
 * Funzione che aggiona i dati della pagina con i dati meteo corretti
 * @async
 */
async function aggiornaDati() {
    leggiParametri();

    try{
        const dati_meteo = await richiestaMeteo();
        aggiornaMeteoCorrente(dati_meteo.current);
        aggiornaTabella(dati_meteo);
    }
    catch(e){
        throw e;
    }
}


/**
 * Funzione che aggiona i dati del meteo attuale
 * @param {Array<Object>} dati_meteo I dati del meteo
 */
function aggiornaMeteoCorrente(dati_meteo){
    temperatura.innerHTML = dati_meteo.temperature_2m
    vento.innerHTML = dati_meteo.wind_speed_10m

    const orario= new Date(dati_meteo.time)
    orarioRilevazione.innerHTML = "Il giorno "+orario.getDate()+"/"+(orario.getMonth()+1)+"/"+orario.getFullYear()+" alle ore "+orario.getHours()+":"+orario.getMinutes();
}

//GESTIONE TABELLA


/**
 * Funzione che aggiorna la tabella con i dati meteo corretti
 * 
 */
function aggiornaTabella(dati_meteo){
    const dati_meteo_giornalieri = dati_meteo.daily

    creaIntestazione(alba_tramonto.checked);

    for (let i=0; i<giorni.value; i++){
        const data=new Date(dati_meteo_giornalieri.time[i])
        const dataNumerica=data.getDate()+"/"+( data.getMonth()+1)+"/"+data.getFullYear()
        const condizione = iconaMeteo(dati_meteo_giornalieri.weather_code[i]);
        const arrayGiornoMeteo=[dataNumerica, condizione, dati_meteo_giornalieri.temperature_2m_max[i], dati_meteo_giornalieri.temperature_2m_min[i]]
        arrayGiornoMeteo.push(dati_meteo_giornalieri.precipitation_sum[i]);
        arrayGiornoMeteo.push(dati_meteo_giornalieri.wind_speed_10m_max[i]);

        if (alba_tramonto.checked){
            const orario_alba=new Date(dati_meteo_giornalieri.sunrise[i])
            const orario_tramonto = new Date(dati_meteo_giornalieri.sunset[i])
            arrayGiornoMeteo.push(orario_alba.getHours()+":"+orario_alba.getMinutes());
            arrayGiornoMeteo.push(orario_tramonto.getHours()+":"+orario_tramonto.getMinutes());
        }
        creaRigaTabella(arrayGiornoMeteo)
    }
}

/**
 * Funzione che dato un codice meteo, restituisce la corrispettiva immagine
 * @param {number} code Il codice meteo 
 * @returns La stringa contenete il codice HTML con tag <img> con la rispettiva immagine
 */
function iconaMeteo(code) {
  if (code === 0)
    return 'Sereno <br><img src="../img/icone/sereno.png" alt="Sereno" width="100px" height="70px">';

  if (code >= 1 && code <= 3)
    return 'Nuvoloso <br><img src="../img/icone/nuvoloso.png" alt="Nuvoloso" width="100px" height="70px">';

  if (code === 45 || code === 48)
    return 'Nebbia <br><img src="../img/icone/nebbia.png" alt="Nebbia" width="100px" height="70px">';

  if ((code >= 51 && code <= 57) || (code>=80 && code<=82))
    return 'Pioggerella <br><img src="../img/icone/pioggia.png" alt="Pioggerella" width="100px" height="70px">';

  if (code >= 61 && code <= 67)
    return 'Pioggia <br><img src="../img/icone/pioggia.png" alt="Pioggia" width="100px" height="70px">';

  if ((code >= 71 && code <= 77) || code==85 || code==86 )
    return 'Neve <br><img src="../img/icone/neve.png" alt="Neve" width="100px" height="70px">';

  if (code >= 95 && code <= 99)
    return 'Temporale <br><img src="../img/icone/temporale.png" alt="Temporale" width="100px" height="70px">';

  return 'Sconosciuto <br><img src="" alt="Sconosciuto" width="100px" height="70px">';
}

/**
 * Funzione che aggiuge un riga alla tabella
 * @param {Array<String>} datiGiornalieri 
 */
function creaRigaTabella(datiGiornalieri){
    const riga= document.createElement("tr")

    for (dato of datiGiornalieri){
        const colonna= document.createElement("td")
        colonna.style="font-size:20px"
        colonna.innerHTML=dato
        riga.append(colonna)
    }

    t_body.append(riga)
}

/**
 * Funzione che crea l'instestazione, in base se l'opzione alba è stata selezionata
 * @param {boolean} alba Se l'alba è stata selezionata 
 */
function creaIntestazione(alba){
    const instestazione=document.createElement("tr")

    t_head.innerHTML=""
    t_body.innerHTML=""

    instestazione.innerHTML="<th>Data</th> <th>Condizione meteo</th> <th>Temperatura massima (°C)</th> <th>Temperatura minima (°C)</th>"
    instestazione.innerHTML+="<th>Somma precipitazioni (mm)</th><th>Vento(Km/h)</th>"

    if (alba) instestazione.innerHTML+="<th>Alba</th> <th>Tramonto</th>"

    t_head.append(instestazione);
}

//GESTIONE EVENT LISTENER

/**Event listener che aggiorna la tabella ad ogni cambiamento della checkbox sul orario dell'alba e tramonto */
alba_tramonto.addEventListener("change", function(){
    aggiornaDati();
})

giorni.addEventListener("change", function(){
    if (this.value < 1) this.value=1;
    else if (this.value>16) this.value=16;
    
    aggiornaDati();
})

/**Event listener che illumina la stella se il mouse ci passa sopra */
stella.addEventListener("mouseover", function(){
    if(!favorito) stella.src="../img/Stella_piena.png";
})

/**Event listener che spegne la stella se il mouse passa fuori da essas */
stella.addEventListener("mouseout", function(){
   if (!favorito) stella.src="../img/Stella_vuota.png";
})

/**Event listener che salva nel localStorage i dati del comune in caso il comune venga scelto come preferito */
stella.addEventListener("click", function(){
    if (!favorito){
        localStorage.setItem("Preferito", [nome,latitudine, longitudine]);
        stella.src="../img/Stella_piena.png";
        favorito=true;
    }
    else{
        favorito=false;
        localStorage.removeItem("Preferito")
    }
})

/**
 * Funzione che mostra il caricamento della pagina
 * @param {number} punti Il numero di punti da inserire
 * @param {HTMLCollection} elemento L'elemento su cui mostrare il caricamento 
 */
function mostraCaricamento(punti, elemento) {
  elemento.textContent =
    "Caricamento dei comuni" + ".".repeat(punti);
}

/**
 * Event Listener che imposta il titolo corretto, e aggiorna i dati
 */
document.addEventListener("DOMContentLoaded", function(){
    const paragrafo = document.getElementById("paragrafoCaricamento");

    let punti = 0;

    const caricamento = setInterval(() => {
        punti = (punti + 1) % 4;
        mostraCaricamento(punti, paragrafo);
    }, 300);

    aggiornaDati()
      .then(()=>{
        titolo.innerHTML="3DMeteo: "+nome
        nome_finesta.innerHTML+=nome
        clearInterval(caricamento);
        paragrafo.innerHTML=""
      })
      .catch(() =>{
        clearInterval(caricamento);
        paragrafo.innerHTML="Errore nel caricamento del meteo. Riprovare più tardi."
      })

    localStorage.setItem("Recente", [nome, latitudine, longitudine]);
})

