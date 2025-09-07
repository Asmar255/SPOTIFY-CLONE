console.log("starting javascript")
let currentsong = new Audio();
let songs
let currfolder

function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00";
    }
    totalSeconds = Math.floor(totalSeconds);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let minutesStr = minutes < 10 ? "0" + minutes : "" + minutes;
    let secondsStr = seconds < 10 ? "0" + seconds : "" + seconds;
    return minutesStr + ":" + secondsStr;
}


async function getsongs(folder) {
    currfolder = folder
    let a = await fetch(`/songs/${folder}/`)
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    console.log(as)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //PUTTING THE SONGS IN THE LIBRARY
    let songul = document.querySelector(".songlistul")
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> 
        
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>harry</div>
                            </div>
                            <div class="playnow">
                                <span>PLay Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                            </li>`

    }
    //attaching each song with a event listener
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/songs/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00 "
}

async function displayalbums(params) {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get the meta data ofe ach folder\
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <circle cx="16" cy="16" r="16" fill="green" />
                                <polygon points="12,10 12,22 22,16" fill="white" />
                            </svg>

                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="image">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //adding the loading of libarary when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })
   
}

async function main(params) {
    //showing the songs of the playlist 
    await getsongs("ncs")
    playmusic(songs[0], true)

    //display all the albunms on the page
    displayalbums()

    //attach an event listner to play, next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    //add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    //adding the opening of the hamburger of the left
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //adding the closing of the hamburger of the left
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-300%"
    })

    //adding an event listner for previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            // currentsong.pause()
            playmusic(songs[index - 1])
        }
    })

    //adding an event listner for next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) <= songs.length - 1) {
            playmusic(songs[index + 1])
        }
    })

    //adding the event listner to the volumne
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
    })

    //add event listner to mute the track
    document.querySelector(".volumne>img").addEventListener("click",e=>{
        console.log(e)
        console.log("changing",e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume=0
            console.log(
            document.querySelector(".range").getElementsByTagName("input")[0])
            document.querySelector(".range").getElementsByTagName("input")[0]=0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=0.1
            document.querySelector(".range").getElementsByTagName("input")[0]=0.1
        }
    })

}
main()