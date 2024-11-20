let pararTarea = false;
let idioma = "es";
window.addEventListener('load', async () => {
    const URL = "https://pokeapi.co/api/v2/";
    const data = await obtenerData(URL);
    crearBotonesTipos(data);
    crearBotonesIdiomas(data);
    await mostrarPokemon(data);    
});
async function obtenerData(URL) {
    const response = await fetch(URL);
    if (response.ok) {
        const data = await response.json();
        return data;
    }
    return null;
}
async function crearBotonesIdiomas(data) {
    let idiomas = (await obtenerData(data.language)).results;
    idiomas.forEach(async idio =>{
        let idiomaData = await obtenerData(idio.url);
        let nombreIdioma = idiomaData.names.find(id => id.language.name == idiomaData.name);
        console.log(idiomaData);
        console.log(nombreIdioma ? nombreIdioma.name : idiomaData.name);
        
        
        let option = document.createElement("option");
        option.value = idiomaData.name;
        option.innerText = nombreIdioma ? nombreIdioma.name : idiomaData.name;
        
        if (idioma == idiomaData.name) {
            option.selected = "selected";            
        }
        document.querySelector("#idiomas").append(option)
    })
    let select = document.querySelector("select");
    select.addEventListener("change", async () => {
        pararTarea = true;
        setTimeout(async () => {
            idioma = select.value;
            document.querySelector(".activo").click();
            await crearBotonesTipos(data);
        }, 400);
    });
    
}
async function crearBotonesTipos(data) {
    const nTipos = await obtenerData(data.type).then(data => data.count);
    const translations = {
        en: "All",
        es: "Todos",
        fr: "Tous"
    };
    
    const text = translations[idioma] || translations['en'];
    
    document.querySelector("header nav").innerHTML = `<div class="tipo activo" data-type="todos">${text}</div>`;

    for (let i = 1; i <= nTipos; i++) {
        const tipo = await obtenerData(`${data.type}/${i}`);
        if (tipo) {
            const nombre = tipo.names.find(n => n.language.name === idioma)?.name || tipo.name; // Valor predeterminado si no hay datos
            document.querySelector("header nav").innerHTML += `<div data-type="${tipo.name}" class="tipo ${tipo.name}">${nombre}</div>`;
        }
    }
    habilitarBotones(data);
}

function habilitarBotones(data) {
    document.querySelectorAll(".tipo").forEach(boton => {
        boton.addEventListener("click", async () => {
            document.querySelector(".activo")?.classList.remove("activo");
            boton.classList.add("activo");
            pararTarea = true;
            pokedex.innerHTML = "";
            setTimeout(async() => {
                pararTarea = false;
                pokedex.classList.remove("verDatos");
                if (boton.dataset.type != "todos") {
                    const dataTipo = await obtenerData(`${data.type}${boton.dataset.type}`);
                    for (let i = 0; i < dataTipo.pokemon.length; i++) {
                        if (pararTarea) {
                            pokedex.innerHTML = ""
                            break;
                        }else {
                            let dataPokemon = await obtenerData(dataTipo.pokemon[i].pokemon.url);
                            await imprimirPokemon(dataPokemon);
                        }
                    }
                } else {
                    mostrarPokemon(data);
                }
            }, 100);
        });
    });
}

async function mostrarPokemon(data) {
    let pokemon = await obtenerData(data.pokemon);
    while (pokemon.next && !pararTarea) {
        let listaPokemon = pokemon.results;
        for (let i = 0; i < listaPokemon.length; i++) {
            let url = listaPokemon[i].url;            
            if (url && url !== "null" && !pararTarea) {
                let dataPokemon = await obtenerData(url);
                if (pararTarea) {
                    pokedex.innerHTML = "";
                }else{
                    await imprimirPokemon(dataPokemon);
                }
            }
        }
        pokemon = await obtenerData(pokemon.next);
    }
}

async function imprimirPokemon(dataPokemon) {
    let img = dataPokemon.sprites.other["official-artwork"].front_default;
    let div = document.createElement("div");
    div.classList.add("pokemon");
    div.innerHTML = `<div class="pokemon-id-bg">
                                <p>#${dataPokemon.id.toString().padStart(3,'0')}</p>
                            </div>
                            <div class="pokemon-img">
                                <img src="${ img && img !== "null" ? img : "./noimg.jpg"}" alt="${dataPokemon.name}">
                            </div>
                            <div class="datos-pokemon">
                                <p class="pokemon-id">#${dataPokemon.id.toString().padStart(3,'0')}</p>
                                <p class="pokemon-nombre">${dataPokemon.name}</p>
                            </div>
                            <div class="tipos"> 
                                ${await obtenerTipos(dataPokemon)}
                            </div>
                            <div class="pokemon-stats">
                                <p class="stat" id="peso">${dataPokemon.weight/10}Kg</p>
                                <p class="stat" id="altura">${dataPokemon.height/10}M</p>
                            </div>`
    pokedex.append(div);
    div.addEventListener("click", ()=>mostrarInformacionPokemon(dataPokemon.id));
}
function mostrarInformacionPokemon(id){
    document.querySelector(".activo").classList.remove("activo");
    pararTarea = true;
    setTimeout(() => {
        pararTarea = false;
        pokedex.innerHTML = `<div class="pokemon">wqe</div>`
        pokedex.classList.add("verDatos");
    }, 300);
}
async function obtenerTipos(dataPokemon) {
    let tipos = "";
    for (let i = 0; i < dataPokemon.types.length; i++) {
        tipos += `<div class="tipo ${dataPokemon.types[i].type.name}">${await obtenerNombreIdioma(dataPokemon.types[i].type)}</div>`;     
    }
    return tipos;
}

async function obtenerNombreIdioma(tipo) {
    const tipoData = await obtenerData(tipo.url);
    return tipoData.names.find(n => n.language.name === idioma)?.name || tipoData.name; // Valor predeterminado
}
