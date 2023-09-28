const mysql = require('mysql2');
const fs = require('fs');

/// Leer el archivo JSON con los datos
const jsonData = fs.readFileSync('./trailerflix.json', 'utf8');
const data = JSON.parse(jsonData);


// Configuración de la conexión a la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'trailerflix'
};

// Crear una conexión a la base de datos
const connection = mysql.createConnection(dbConfig);

// Conectar a la base de datos
connection.connect(err => {
    if (err) {
        console.error('Error de conexión:', err);
        throw err;
    }

    console.log('Conexión a la base de datos establecida.');

    let id_catalogo_genero, id_catalogo_reparto;
    id_catalogo_genero = 0;
    id_catalogo_reparto = 0;

    for (const item of data) {

        const id_catalogo = item.id;

        //console.log(`Estoy por cargar la fila: ${item.id}`);

        // Me fijo si el ID ya esta cargado en la tabla categoria
        connection.query('SELECT id_catalogo FROM catalogo WHERE id_catalogo = ?', [id_catalogo], (err, result) => {
            if (err) {
                console.error('La fila ya esta cargada en la tabla catalogo:', err);
                throw err;
            }
            else {

                let id_categoria = 1;

                if (item.categoria === 'Serie') {
                    id_categoria = 2;
                }
                //console.log(`La categoria es: ${item.categoria} y el codigo es ${id_categoria}.`);


                //console.log(`La fila: ${item.id} aun no esta cargada en la tabla catalogo, la cargo.`);

                const poster = item.poster;
                const titulo = item.titulo;
                const resumen = item.resumen;

                temporadas = typeof item.temporadas === 'string' ? null : item.temporadas;
                temporadas = temporadas === null ? 0 : item.temporadas;

                let trailer;
                if (item.trailer) {
                    trailer = item.trailer;
                    trailer = trailer === null ? " " : item.trailer;
                }
                else {
                    trailer = " ";
                }



                connection.query('INSERT INTO catalogo (id_catalogo, poster, titulo, id_categoria, resumen, temporadas, trailer) VALUES (?,?,?,?,?,?,?)', [id_catalogo, poster, titulo, id_categoria, resumen, temporadas, trailer], (err, result) => {
                    if (err) {
                        console.error('Error al cargar el catologo:', err);
                        throw err;
                    }
                    else {
                        //console.log('Se cargo el catalogo.');
                    }
                });
            }



            let generos;
            generos = item.genero.split(',');
            generos.forEach(genero => {
                const gen_aux = genero.trim().replace('?', '').replace('¿', '');
                connection.query('SELECT id_genero FROM genero WHERE descripcion = ?', gen_aux, (err, result) => {
                    if (result[0]) {
                        id_catalogo_genero += 1;
                        const id_genero = result[0].id_genero;
                        //console.log(`Num ${id_catalogo_genero} El genero es ${gen_aux} codigo ${id_genero}.`);

                        connection.query("INSERT INTO catalogo_genero (id_catalogo_genero, id_catalogo, id_genero) VALUES (?,?,?) ", [id_catalogo_genero, id_catalogo, id_genero], () => { });
                    }
                    else {
                        //console.log(`El genero ${gen_aux} no se encontro.`);
                    }
                });
            });


            let actores;
            actores = item.reparto.split(',');
            actores.forEach(actor => {
                const actor_aux = actor.trim().replace('?', '').replace('¿', '');
                connection.query('SELECT id_reparto FROM reparto WHERE nombre = ?', actor_aux, (err, result) => {
                    if (result[0]) {
                        id_catalogo_reparto += 1;
                        const id_reparto = result[0].id_reparto;
                        //console.log(`Num ${id_catalogo_reparto} El actor es ${actor_aux} codigo ${id_reparto}.`);

                        connection.query("INSERT INTO catalogo_reparto (id_catalogo_reparto, id_catalogo, id_reparto) VALUES (?,?,?) ", [id_catalogo_reparto, id_catalogo, id_reparto], () => { });
                    }
                    else {
                        //console.log(`El actor ${actor_aux} no se encontro.`);
                    }
                });
            });

        });
    }
});
