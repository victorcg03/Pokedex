let pararTarea = false;
window.addEventListener('load', async () => {
    const URL = "https://pokeapi.co/api/v2/";
    const data = await obtenerData(URL);
    await crearBotonesTipos(data);
    habilitarBotones(data);
    mostrarPokemon(data);
});

function habilitarBotones(data) {
    document.querySelectorAll(".tipo").forEach(boton => {
        boton.addEventListener("click", async () => {
            document.querySelector(".activo").classList.remove("activo");
            boton.classList.add("activo");
            pararTarea = true;
            pokedex.innerHTML = "";
            setTimeout(async() => {
                pararTarea = false;
                if (boton.dataset.type != "todos") {
                    const dataTipo = await obtenerData(`${data.type}${boton.dataset.type}`);
                    for (let i = 0; i < dataTipo.pokemon.length; i++) {
                        if (pararTarea) {
                            pokedex.innerHTML = ""
                            console.log("Tarea interrumpida");
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
            if (pararTarea) {
                pokedex.innerHTML = "";
                return;
            }
            let url = listaPokemon[i].url;
            if (url && url !== "null" && !pararTarea) {
                let dataPokemon = await obtenerData(url);
                await imprimirPokemon(dataPokemon);
            }
        }
        pokemon = await obtenerData(pokemon.next);
    }
}

async function obtenerData(URL) {
    const response = await fetch(URL);
    if (response.ok) {
        const data = await response.json();
        return data;
    }
    return null;
}

async function crearBotonesTipos(data) {
    const nTipos = await obtenerData(data.type).then(data => data.count);
    for (let i = 1; i <= nTipos; i++) {
        const tipo = await obtenerData(`${data.type}/${i}`);
        if (tipo) {
            const nombreEspanol = tipo.names.find(n => n.language.name === "es").name;
            document.querySelector("header nav").innerHTML += `<div data-type="${tipo.name}" class="tipo ${tipo.name}">${nombreEspanol}</div>`;
        }
    }
}

async function imprimirPokemon(dataPokemon) {
    let img = dataPokemon.sprites.other["official-artwork"].front_default;
    pokedex.innerHTML += `<div class="pokemon">
                            <div class="pokemon-id-bg">
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
                                <p class="stat" id="peso">${dataPokemon.weight}Kg</p>
                                <p class="stat" id="altura">${dataPokemon.height}M</p>
                            </div>
                        </div>`
}

async function obtenerTipos(dataPokemon) {
    let tipos = "";
    for (let i = 0; i < dataPokemon.types.length; i++) {
        tipos += `<div class="tipo ${dataPokemon.types[i].type.name}">${await obtenerNombreEsp(dataPokemon.types[i].type)}</div>`;     
    }
    return tipos;
}

async function obtenerNombreEsp(tipo) {
    return (await obtenerData(tipo.url)).names.find(n => n.language.name === "es").name;
}
