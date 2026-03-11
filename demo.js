import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = 5000;
const BASE_URL = "https://t4e-demotestserver.onrender.com/api";

let dataset = [];

const loadData = async () => {
    const response = await axios.post(`${BASE_URL}/public/token`,{
        "studentId": "E0223016",
        "set": "setA"
    });
    const token = response.data.token;
    const dataUrl = response.data.dataUrl;

    const dataResponse = await axios.get(`${BASE_URL}${dataUrl}`,{
        headers:{
            Authorization: `Bearer ${token}`
        }
    });
    dataset = dataResponse.data.data.movies;

    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
        
    });
}
loadData();

app.get("/",(req,res)=>{
    res.send("Server is working");
})

app.get("/movies",(req,res)=>{
    res.json({
        "Total Movies": dataset.length,
        "Movies": dataset
    });
});

app.get("/movies/search",(req,res) => {
    const genre = req.query.genre;
    const result = dataset.filter(movie => movie.genre.includes(genre));
    if(result.length === 0){
        res.json({message: "No Movies Found for the Genre"});
    }
    else{
        res.json(result);
    }
});

app.get("/movies/count",(req,res)=>{
    res.json({"Total Movies": dataset.length});
});

app.get("/movies/genres", (req,res) =>{
    const allgenre = dataset.flatMap(g => g.genre);
    const unique = [...new Set(allgenre)];
    res.json({"Unique Genres": unique.length});
    res.json(unique);
});

app.get("/movies/multi-genre",(req,res) => {
    const result = dataset.filter(movie => movie.genre.length > 1);
    if(result.length === 0){
        res.json({message: "No Movie found"})
    }
    else{
        res.json(result);
    }
})

app.get("/movies/genre/count",(req,res)=> {
    const result = dataset.reduce((acc,mov)=>{
        mov.genre.forEach(g => acc[g] = (acc[g] || 0)+1);
        return acc;
    },{});
    res.json(result);
})

app.get('/movies/genre/first', (req, res) => {
    const result = dataset.reduce((acc, mov) => {
        mov.genre.forEach(g => {
            if(!acc[g]){
                acc[g] = mov.name;
            }
        });
        return acc;
    }, {});
        res.json(result);
});

app.get('/movies/genre/popular',(req,res)=>{
    const result = dataset.reduce((acc,mov)=>{
        mov.genre.forEach(g => acc[g] = (acc[g] || 0)+1);
        return acc;
    },{});
    const Popular = Object.entries(result).reduce((acc,gen)=>{
        return acc[1] > gen[1]? acc : gen;
    });
    res.json({
        genre: Popular[0],
        count: Popular[1]
    });
});

app.get('/movies/genre/:genre/count',(req,res)=>{
    const genreName = req.params.genre.toLowerCase();
    const result = dataset.reduce((acc,mov)=>{
        mov.genre.forEach(g => acc[g.toLowerCase()] = (acc[g.toLowerCase()] || 0)+1);
        return acc;
    },{});
    const count = result[genreName];
    res.json({
        genre: genreName,
        count: count
    });

});

app.get("/movies/:id",(req,res)=>{
    const id = req.params.id;
    const movie = dataset.find(movie => movie.id === id);
    if(!movie){
        res.json({message: "Movie not found"});
    }
    else{
        res.json(movie);
    }
})

