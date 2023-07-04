let features = ["danceability","energy","speechiness","acousticness","liveness", "valence"];

let radarSvg = undefined;
let radarRadialScale = undefined;

const radarDimension = d3.select('svg');
const radarSvgWidth = +radarDimension.style('width').replace('px','');
const radarSvgHeight = +radarDimension.style('height').replace('px','');

let genreAttributes = {genre: undefined, danceability: 0.0, energy: 0.0, speechiness: 0.0,
    acousticness: 0.0, liveness: 0.0, valence: 0.0};
let genres = [];
let currentGenres = [];
let closestMatch = [];
let firstScroll = true;

let radarAnimationSpeed = 800;
let rawSpotifyData = undefined;

document.addEventListener('DOMContentLoaded', function () {

    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/songs_normalize.csv')])
        .then(function (values) {
            rawSpotifyData = values[0];

            const groupedSpotifyData = d3.group(rawSpotifyData, d=> d['genre'].split(',')[0]);

            groupedSpotifyData.forEach(songsOfGenre => {
                let tempGenreAttributes = Object.create(genreAttributes);
                tempGenreAttributes.genre = songsOfGenre[0]['genre'].split(',')[0];
                songsOfGenre.forEach(song => {
                    tempGenreAttributes.danceability = tempGenreAttributes.danceability + parseFloat(song.danceability) || 0;
                    tempGenreAttributes.energy = tempGenreAttributes.energy + parseFloat(song.energy) || 0;
                    tempGenreAttributes.speechiness = tempGenreAttributes.speechiness + parseFloat(song.speechiness) || 0;
                    tempGenreAttributes.acousticness = tempGenreAttributes.acousticness + parseFloat(song.acousticness) || 0;
                    tempGenreAttributes.liveness = tempGenreAttributes.liveness + parseFloat(song.liveness) || 0;
                    tempGenreAttributes.valence = tempGenreAttributes.valence + parseFloat(song.valence) || 0;

                })
                tempGenreAttributes.danceability = tempGenreAttributes.danceability / songsOfGenre.length;
                tempGenreAttributes.energy = tempGenreAttributes.energy / songsOfGenre.length;
                tempGenreAttributes.speechiness = tempGenreAttributes.speechiness / songsOfGenre.length;
                tempGenreAttributes.acousticness = tempGenreAttributes.acousticness / songsOfGenre.length;
                tempGenreAttributes.liveness = tempGenreAttributes.liveness / songsOfGenre.length;
                tempGenreAttributes.valence = tempGenreAttributes.valence / songsOfGenre.length;

                genres.push(tempGenreAttributes);
            })

            makeRadarWaypoints();

        });
});

function makeRadarWaypoints(){
    new Waypoint({
        element: document.getElementById('radarChartStep1'),
        handler: function(direction) {
            if(direction === 'down' && firstScroll){
                radarChartStep1();
            } else {

            }
        },
        offset: '50%'
    });

    new Waypoint({
        element: document.getElementById('radarChartStep4'),
        handler: function(direction) {
            if(direction === 'down'){
                topGenreComparison();
            } else {

            }
        },
        offset: '50%'
    });

    new Waypoint({
        element: document.getElementById('radarChartStep6'),
        handler: function(direction) {
            if(direction === 'down'){
                drawCustomGenre();
            } else {
                topGenreComparison();
            }
        },
        offset: '50%'
    });
}

function radarChartStep1(){
    firstScroll = false;
    radarSvg = d3.select("#radarChartSvg")
    radarRadialScale = d3.scaleLinear()
        .domain([0,1])
        .range([0,200]);


    let ticks = [0.2,0.4,0.6,0.8,1];

    ticks.forEach(t =>
        radarSvg.append("circle")
            .attr("cx", radarSvgWidth/2)
            .attr("cy", radarSvgHeight/2)
            .transition()
            .duration(radarAnimationSpeed)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", radarRadialScale(t))
    );

    ticks.forEach(t =>
        radarSvg.append("text")
            .attr("x", radarSvgWidth/2 + 5)
            .attr("y", radarSvgHeight/2 - radarRadialScale(t))
            .transition()
            .delay(radarAnimationSpeed)
            .duration(radarAnimationSpeed)
            .attr('opacity', 1)
            .text(t.toString())
    );

    for (var i = 0; i < features.length; i++) {
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        let line_coordinate = angleToRadarCoordinate(angle, 1);
        let label_coordinate = angleToRadarCoordinate(angle, 1.1);

        //draw axis line
        radarSvg.append("line")
            .attr("x1", radarSvgWidth/2)
            .attr("y1", radarSvgHeight/2)
            .attr("x2", line_coordinate.x)
            .attr("y2", line_coordinate.y)
            .transition()
            .delay(radarAnimationSpeed)
            .duration(radarAnimationSpeed)
            .attr('opacity', 1)
            .attr("stroke","black");

        //draw axis label
        radarSvg.append("text")
            .attr("x", label_coordinate.x)
            .attr("y", label_coordinate.y)
            .transition()
            .delay(radarAnimationSpeed)
            .duration(radarAnimationSpeed)
            .attr('opacity', 1)
            .text(ft_name);
    }
}

function topGenreComparison(){
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    currentGenres[0] = genres.filter(d => d.genre === 'pop');
    currentGenres[1] = genres.filter(d => d.genre === 'hip hop');

    const color = d3.scaleOrdinal()
        .domain([currentGenres[0], currentGenres[1], currentGenres[2]])
        .range(["#005a00","#b30000", "#0000ff"])

    radarSvg.selectAll('.paths')
        .data(currentGenres, d => d.genre)
        .join(
            enter => enter.append('path')
                .transition()
                .duration(radarAnimationSpeed)
                .attr("d",(d) => {return line(getRadarPathCoordinates(d[0]));})
                .attr("stroke-width", 3)
                .attr("stroke", color.genre)
                .attr("fill", color)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5),
            update => update
                .transition()
                .duration(radarAnimationSpeed)
                .attr("d",(d) => {return line(getRadarPathCoordinates(d[0]));})
                .style('opacity', 0.5),
            exit => exit
                .transition()
                .duration(radarAnimationSpeed)
                .style('opacity', 0)
                .remove() //Transition the element and then remove
        )
        .classed('paths', true) //Used to change hover opacity
}

function drawGenre(genre){
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    const color = d3.scaleOrdinal()
        .range(["#0000ff"])

    currentGenres[2] = genres.filter(d => d.genre === genre);

    radarSvg.selectAll('.paths')
        .data(currentGenres, currentGenres.genre)
        .join(
            enter => enter.append('path')
                .transition()
                .duration(radarAnimationSpeed)
                .attr("d",(d) => {return line(getRadarPathCoordinates(d[0]));})
                .attr("stroke-width", 3)
                .attr("stroke", color)
                .attr("fill", color)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5),
            update => update
                .transition()
                .duration(radarAnimationSpeed)
                .attr("d",(d) => {return line(getRadarPathCoordinates(d[0]));})
                .style('opacity', 0.5),
            exit => exit
                .transition()
                .duration(radarAnimationSpeed)
                .style('opacity', 0)
                .remove() //Transition the element and then remove
        )
        .classed('paths', true) //Used to change hover opacity
}

function drawClosest(genre, song){
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    closestMatch[1] = genre;
    closestMatch[2] = song;

    const color = d3.scaleOrdinal()
        .domain([closestMatch[0], genre, song])
        .range(["#ec7500","#005a00","#b30000"])

    radarSvg.selectAll('.paths')
        .data(closestMatch, d => d.genre)
        .join(
            enter => enter.append('path')
                .transition()
                .duration(radarAnimationSpeed)
                .attr("d",(d) => {return line(getRadarPathCoordinates(d));})
                .attr("stroke-width", 3)
                .attr("stroke", color)
                .attr("fill", color)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5),
            update => update
                .transition()
                .duration(300)
                .attr("d",(d) => {return line(getRadarPathCoordinates(d));})
                .style('opacity', 0.5),
            exit => exit
                .transition()
                .duration(100)
                .style('opacity', 0)
                .remove() //Transition the element and then remove
        )
        .classed('paths', true) //Used to change hover opacity
}

function drawCustomGenre(danceability, energy, speechiness, acousticness, liveness, valence){
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    if(!isNaN(danceability))
        closestMatch[0] =  {genre: 'custom', danceability: +danceability, energy: +energy, speechiness: +speechiness,
            acousticness: +acousticness, liveness: +liveness, valence: +valence};

    const color = d3.scaleOrdinal()
        .domain([closestMatch[0], closestMatch[1], closestMatch[2]])
        .range(["#ec7500","#005a00","#b30000"])

    radarSvg.selectAll('.paths')
        .data(closestMatch, d => d.genre)
        .join(
            enter => enter.append('path')
                .transition()
                .duration(radarAnimationSpeed)
                .attr("d",(d) => {return line(getRadarPathCoordinates(d));})
                .attr("stroke-width", 3)
                .attr("stroke", color)
                .attr("fill", color)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5),
            update => update
                .transition()
                .duration(300)
                .attr("d",(d) => {return line(getRadarPathCoordinates(d));})
                .style('opacity', 0.5),
            exit => exit
                .transition()
                .duration(100)
                .style('opacity', 0)
                .remove() //Transition the element and then remove
        )
        .classed('paths', true) //Used to change hover opacity
}

function computeClosestMatch(danceability, energy, speechiness, acousticness, liveness, valence){
    var closestSongError = Number.MAX_VALUE;
    var closestSong = undefined;
    rawSpotifyData.forEach(song => {
        const dError = Math.abs(song.danceability - danceability);
        const eError = Math.abs(song.energy - energy);
        const sError = Math.abs(song.speechiness - speechiness);
        const aError = Math.abs(song.acousticness - acousticness);
        const lError = Math.abs(song.liveness - liveness);
        const vError = Math.abs(song.valence - valence);
        const totalError = dError + eError + sError + aError + lError + vError;
        if(totalError < closestSongError){
            closestSongError = totalError;
            closestSong = song;
        }
    })
    console.log(closestSong);


    var closestGenreError = Number.MAX_VALUE;
    var closestGenre = undefined;
    genres.forEach(genre =>{
        const dError = Math.abs(genre.danceability - danceability);
        const eError = Math.abs(genre.energy - energy);
        const sError = Math.abs(genre.speechiness - speechiness);
        const aError = Math.abs(genre.acousticness - acousticness);
        const lError = Math.abs(genre.liveness - liveness);
        const vError = Math.abs(genre.valence - valence);
        const totalError = dError + eError + sError + aError + lError + vError;
        if(totalError < closestGenreError){
            closestGenreError = totalError;
            closestGenre = genre;
        }
    })
    console.log(closestGenre);

    d3.select("#closestGenre").html('Your closest <span style="color: #005a00" >genre</span>: ' + closestGenre.genre);
    d3.select("#closestSong").html('Your closest <span style="color: #b30000">song</span>: ' + closestSong.song + ' by ' + closestSong.artist);
    d3.select("#goToSpotifyButton")
        .classed('hidden', false)
        .text("View on Spotify")
        .on('click', function(event, d){
        window.open(encodeURI(url), '_blank');
    })

    let track = closestSong.song.replaceAll(' ', '%20');
    let artist = closestSong.artist.replace(' ', '%20')+ '%20';
    let url = 'https://open.spotify.com/search/artist:' + artist + 'track:' + track;

    drawClosest(closestGenre, closestSong);
    //window.open(encodeURI(url), '_blank');
    document.getElementById('radarChartStep7').scrollIntoView(false);
}

function getRadarPathCoordinates(data_point){
    let coordinates = [];
    for (var i = 0; i < features.length; i++){
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angleToRadarCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
}

function angleToRadarCoordinate(angle, value){
    let x = Math.cos(angle) * radarRadialScale(value);
    let y = Math.sin(angle) * radarRadialScale(value);
    return {"x": radarSvgWidth/2 + x, "y": radarSvgHeight/2 - y};
}



