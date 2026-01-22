const tuttiIComuni=[];

const selectRegione=document.getElementById("selectRegione")
const selectProvincie=document.getElementById("selectProvincia")
const selectComuni=document.getElementById("selectComune")


const mappa = L.map('mappa').setView([41.9, 12.483333 ], 6);
const gruppo=L.layerGroup().addTo(mappa);
const arrayComuniSelezionati=[]

const visualizzazione_preferito=document.getElementById("comunePreferito");
const visualizzazione_recente=document.getElementById("comuneRecente");
const bottoneCancella=document.getElementById("cancellaDati");

//GESTIONE SELECT E FILTRAGGIO COMUNI

/**
 * Funzione che data una select e un array, crea e aggiunge gli elementi dell'array come tag option della select
 * @private
 * @param {HTMLCollection} select La select da aggiuggere
 * @param {string[]} arrayDaAggiungere L'array da aggiungere
 */ 
function aggiungiOpzioniSelect(select, arrayDaAggiungere){
    for(let i=0; i<arrayDaAggiungere.length; i++){
        const elem= document.createElement("option")
        elem.innerHTML=arrayDaAggiungere[i]
        elem.value = arrayDaAggiungere[i];
        select.append(elem)
    }
}

/**
 * Funzione che normalizza un testo in input
 * @param {String} testo Il testo da normalizzare
 * @returns Il testo normalizzato 
 */
function normalizza(testo) {
    return testo
        ?.toLowerCase()      // minuscolo
        .normalize("NFD")    // separa accenti
        .replace(/[\u0300-\u036f]/g, "") // rimuove accenti
        .replace(/[-]/g, " ") // sostituisce trattini
        .trim()
        .split("/")[0];
}


/**Funzione che estrae le regioni dal array, elimina i dublicati, ordina, e le aggiuge come opzioni alla select giusta**/

function creaRegioni(){
    const regioni= []

    regioni.push(...tuttiIComuni.map(function(x){
        return x.regione.nome;
    }))

    const setRegioni= new Set(regioni)
    const arrayRegioni=[]
    arrayRegioni.push(...setRegioni)

    arrayRegioni.sort()

    aggiungiOpzioniSelect(selectRegione, arrayRegioni);
}



/**
 * Funzione che aggiorna la select delle provincie
 * @param {string} regione La regione per cui filtrare
 */
function aggiornaSelectProvincie(regione){
    //Filtro l'array e dopo estraggo il nome della provincia
    const arrFiltrato=tuttiIComuni.
                    filter(function(x){
                        return x.regione.nome==regione;
                    })
                    
                    
    const arrayProvincie= arrFiltrato.map(function(x){
                        return x.provincia.nome;
                    })

    localizzazioneComune(arrFiltrato[0].nome).then(risposta =>{
            if (risposta != null){
                    mappa.flyTo([risposta[0], risposta[1]],9)
            }
    })

    //Casto l'array filtrato in un Set (Tolgo i dublicati), in seguito lo ordino (Set non è ordinato)
    const setProvincie= new Set(arrayProvincie)
    const arrayProvincieFiltrate=[]
    arrayProvincieFiltrate.push(...setProvincie)
    arrayProvincieFiltrate.sort()
    
    //Aggiungo le provincie come opzioni della loro select
    aggiungiOpzioniSelect(selectProvincie, arrayProvincieFiltrate);
}

 /* Funzione che aggiorna la select dei comuni
 * @param {string} provincia La provicia per cui filtrare
 * @returns {String[]} Una lista di tutti i comuni filtrati
 */
function aggiornaSelectComuni(provincia){
    //Filtro l'array ed dopo estraggo il nome del comune
    const arrFiltrato=tuttiIComuni.
                    filter(function(x){
                        return x.provincia.nome==provincia;
                    })
                    
    const arrayComuni=arrFiltrato.map(function(x){
                        return x.nome;
                    })
    
    //Casto l'array filtrato in un Set (Tolgo i dublicati), in seguito lo ordino (Set non è ordinato)
    const setComuni= new Set(arrayComuni)
    const arrayComuniFiltrati=[]
    arrayComuniFiltrati.push(...setComuni)
    arrayComuniFiltrati.sort()


    aggiungiOpzioniSelect(selectComuni, arrayComuniFiltrati);

    //Aggiungo i comuni come opzioni della loro select
    arrayComuniSelezionati.push(...arrFiltrato);
}

/**
 * Funzione che gestisce il localStorage del comune preferito
 */
function gestionePreferito(){
    const preferito = localStorage.getItem("Preferito");
    if (preferito){
        const comunePref= preferito.split(",")
        const link_dettaglio=generaLinkDettaglio(comunePref[0],comunePref[1], comunePref[2]);
        visualizzazione_preferito.innerHTML+= '<a href="'+link_dettaglio+'" style="color:darkorange;">'+comunePref[0]+"</a>";
    }else{
        visualizzazione_preferito.innerHTML="Non hai un comune preferito"
    }
}

/**
 * Funzione che gestisce il localStorage del comune recente
 */
function gestioneRecente(){
    const recente = localStorage.getItem("Recente");
    console.log(recente)
    if (recente){
        const comuneRec= recente.split(",")
        const link_dettaglio=generaLinkDettaglio(comuneRec[0],comuneRec[1], comuneRec[2]);
        visualizzazione_recente.innerHTML+= '<a href="'+link_dettaglio+'" style="color:darkorange;">'+comuneRec[0]+"</a>";
    }
    else{
        visualizzazione_recente.innerHTML="Non hai nessun comune recente"
    }
}

//GESTIONE MAPPA

/**
 * Funzione che carica il tile layer
 * @private
 */
function caricaMappa(){
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mappa);
}

/**
 * Funzione che genera il link alla pagina di dettaglio per ogni comune
 * @param {String} nome Il nome del comune
 * @param {number} lat La latitudine del comune 
 * @param {number} long La longitudine del comune 
 * @returns Il link alla pagina del dettaglio
 */
function generaLinkDettaglio(nome, lat, long){
    const URL_DETTAGLIO="dettaglio.html?"
    const link=URL_DETTAGLIO+"nome="+nome+"&lat="+lat+"&lon="+long
    return link;
}

/**
 * Funzione che interrope il flusso di una promise per un tot di tempo
 * @param {number} ms Per quanto tempo bisogna interropere, in ms
 * @returns La promise contenete un timeout con i secondi richiesti
 * @private
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Funzione che modifica la mappa aggiugedo i marker, i popup, e i bougs di un certo array di comuni dato
 * @param {Array<Object>} arrayComuni 
 * @async
 */
async function modificaMappa(arrayComuni) {
    let minLat = Infinity;
    let minLon = Infinity;
    let maxLat = -Infinity;
    let maxLon = -Infinity;

    for (const comune of arrayComuni){
        //Per ogni comune ottengo le coordinate
        const risultato= await localizzazioneComune(comune.nome);

        //Se le cordinate esistono, inserisco marker, popup
        if (risultato){
            if (risultato[0] < minLat) minLat = risultato[0];
            if (risultato[1] < minLon) minLon = risultato[1];
            if (risultato[0] > maxLat) maxLat = risultato[0];
            if (risultato[1]> maxLon) maxLon = risultato[1];

            const marker = L.marker([risultato[0],risultato[1]])

            
            let contenutoPopup="Comune: "+comune.nome+"<br>Provincia: "+comune.provincia.nome+"("+comune.sigla+")"

            //Per ogni popup ottengo il meteo attuale
            meteoComune(risultato[0], risultato[1]).then(risposta =>{
                contenutoPopup+="<br>Temperatura Attuale: "+risposta+"°C"
                
                contenutoPopup+='<br><button type="button" class="btn btn-primary"><a href="'+generaLinkDettaglio(comune.nome, risultato[0], risultato[1])+'">Clicca qui per ulteriori dettagli meteo</a></button>'

                marker.bindPopup(contenutoPopup).openPopup();

                marker.addTo(gruppo)

            })

            await sleep(5)
        }
    }
    //Imposto il limiti della mappa
    mappa.fitBounds([[minLat, minLon],[maxLat, maxLon]]);
}

//GESTIONE CHIAMATE API

/**
 * Funzione che richiede la temperatura attuale alla API Open-meteo
 * @param {number} lat La latitudine del comune 
 * @param {number} long La longitudine del comune 
 * @returns La temperatura attuale oppure un messaggio di errore
 * @async
 */
async function meteoComune(lan, lon) {
    const URL_METEO="https://api.open-meteo.com/v1/forecast?"

    const URL_MODIFICATO=URL_METEO+"latitude="+lan+"&longitude="+lon+"&current=temperature_2m"

    const rispostaServer= await fetch(URL_MODIFICATO)

    if (!rispostaServer.ok) return "Si è verificato un errore di rete" 

    const risposta_meteo=await rispostaServer.json();

    return risposta_meteo.current.temperature_2m
}


/**
 * Funzione che estrate la latitudine e la longitudine di un comune dalla richiesta alla API Open-meteo-geo 
 * @param {String} comune Il nome del comune da localizzatr 
 * @returns Un array contenente la latitudine e la longitudine del comune, se esso esiste, altrimenti null
 */
async function localizzazioneComune(comune) {
    const URL_GEOLOCALIZZAZIONE="https://geocoding-api.open-meteo.com/v1/search?";

    const URL_DINAMICO=URL_GEOLOCALIZZAZIONE+'name='+comune+'&count=5&language=it&format=json';
    const rispostaServer=await fetch(URL_DINAMICO);

    if (!rispostaServer.ok) return null;
    
    const arrrayJson=await rispostaServer.json();
    
    for (const r of arrrayJson.results || []) {
            if (
            r.admin2 &&
            normalizza(r.admin2).includes(normalizza(selectProvincie.value)) ) {
                return [r.latitude, r.longitude];
        }
    }

    return null;
}

/**Funzione asiscrona che invia la richiesta del file JSON al server, aspesta l risposta, converte il file json in array di oggetti e lo restiuisce
 * @async 
 * @returns {Promise<Object[]>} L'array contenenti i comuni
 * @throws Un errore di rete
 */
async function ricevi() {
    const URL_COMUNI="https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";
    const rispostaServer= await fetch(URL_COMUNI);

    if (!rispostaServer.ok){
        throw new Error ("Errore di rete");
    }

    const arrayJSON=await rispostaServer.json();
    
    return arrayJSON;
}

//GESTIONE EVENT LISTENER

/**
 * Gestione del pulsante che cancella i dati dal localStorage
 */
bottoneCancella.addEventListener("click", function(){
    localStorage.clear();
    gestionePreferito();
    gestioneRecente();
});


/**Event listener che imposta le lunchezze del select a 1 (Elimino tutti i nodi figlio tranne il primo), e aggiorna la select con le opnioni correte**/
selectRegione.addEventListener("change", function(){
    selectProvincie.length=1;
    selectComuni.length=1;
    aggiornaSelectProvincie(selectRegione.value)
    gruppo.clearLayers();
})

/**Event listener che imposta le lunchezze del select a 1 (Elimino tutti i nodi figlio tranne il primo), e aggiorna la select e la mappa con i comuni correti**/
selectProvincie.addEventListener("change", function(){
    selectComuni.length=1;
    arrayComuniSelezionati.length=0
    aggiornaSelectComuni(selectProvincie.value);
    gruppo.clearLayers();

    localizzazioneComune(selectProvincie.value).then(risposta =>{
        if (risposta != null){
            mappa.flyTo([risposta[0], risposta[1]],9)
        }
    })

    modificaMappa(arrayComuniSelezionati).then(result=>{});
})

/**
 * Event listener che alla selezione del comune tramite select apre la pagina di dettaglio
 */
selectComuni.addEventListener("change", function(){
    localizzazioneComune(selectComuni.value).then(result =>{
            if (result != null){
                const link = generaLinkDettaglio(selectComuni.value, result[0], result[1])
                window.location.href=link;
            }
        })
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


/**Event listener che all caricamento della pagina inizia il caricamento dei comuni e dopo carica la select delle regioni*/
document.addEventListener("DOMContentLoaded", () => {
  const paragrafo = document.getElementById("paragrafoCaricamento");

  let punti = 0;

  const caricamento = setInterval(() => {
    punti = (punti + 1) % 4;
    mostraCaricamento(punti, paragrafo);
  }, 300);

  gestionePreferito();
  gestioneRecente();
  caricaMappa();

  ricevi()
    .then(risposta => {
         for(let i=0; i<risposta.length; i++){
            tuttiIComuni.push(risposta[i])
        }
            
        clearInterval(caricamento);
        paragrafoCaricamento.innerHTML=""   
            
        creaRegioni();
    })
    .catch(() => {
      clearInterval(caricamento);
      paragrafo.textContent =
        "Errore nel caricamento dei comuni. Riprovare";
    });
});











 


