import React, { Component } from 'react';
import axios from 'axios';
import jsonp from 'jsonp';
import puff from '../puff.svg';
import ErrorModal from './ErrorModal';
import Suggestions from './Suggestions';
import config from '../firebaseConfig'
var firebase = require("firebase");
firebase.initializeApp(config);
var database = firebase.database();

const omdbPrefix= "https://www.omdbapi.com/";

class SearchBox extends Component{
  constructor(props){
    super(props);
    this.state={value: this.props.series? this.props.series:"" , disabled:false, loading: false, error:false};
    this.handleChange=this.handleChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
    this.toggleError=this.toggleError.bind(this);
    this.handleSuggestionClick=this.handleSuggestionClick.bind(this);
  }

  render(){
    var button=<button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>;
    var loadingIcon= <img src={puff} width={50}/>;
    var suggestions=<Suggestions handleClick={this.handleSuggestionClick}/>;
    return (
    <div>
    <form className="form-inline" onSubmit={this.handleSubmit}>
      <input id={this.props.wide? "wideInput": "navInput"} className="form-control mr-sm-2" type="search" placeholder="Search for a TV show" value={this.state.value} aria-label="Search" onChange={this.handleChange} disabled={this.state.disabled}/>
      {this.state.loading? loadingIcon: button}
    </form>
    {this.props.wide? suggestions: ""}
    <ErrorModal open={this.state.error} toggle={this.toggleError} errorMsg={this.state.errorMsg}/>
    </div>
    );
  }

  handleChange(event){
    this.setState({value:event.target.value});
  }

  handleSubmit(event){
    event.preventDefault();
    this.setState({disabled:true});
    this.updateRatings(this.state.value);
  }
  componentWillReceiveProps(nextProps){
    if(this.props!=nextProps)
      this.setState({value: nextProps.series});
  }

  componentDidMount(){
    if(this.props.pathname != "" && this.props.pathname!=undefined){
      this.setState({value: this.props.pathname});
      this.updateRatings(this.props.pathname);
    }
    
  }

  toggleError() {
    this.setState({
      error: !this.state.error
    });
  }

  handleSuggestionClick(value){
    this.setState({value: value, disabled:true});
    this.updateRatings(value);
  }

  updateRatings(series){
    this.setState({loading:true});
    database.ref('/'+series.toLowerCase()).once('value').then(snap =>{
      if(!snap.exists()){
        this.getRatingsFromOMDB(series);
        return;
      }
      var data=snap.val();
      this.props.updateMethod(data.title, data.seasons);
    });
  }

  getRatingsFromOMDB(series){
    var url=omdbPrefix+"?t="+series+"&type=series&apikey="+process.env.REACT_APP_OMDB_KEY;
    jsonp(url, null, (function (err, data) {
      if (err) {
        this.setState({disabled:false, error: true, loading:false, errorMsg: "Can't access the server. Please try again later."});
          return;
      } else {
       if(data.Title===undefined || data.totalSeasons== "N/A"){   
          this.setState({disabled:false, error: true, loading:false, errorMsg: "Sorry, couldn't find that series :("});        
          return;
        }
        this.getSeasons(data.Title, parseInt(data.totalSeasons));
      }
    }).bind(this));
  }

  getSeasons(series,numOfSeasons){
    const seasons=[];
    var promises=[];
    for(var i=1;i<=numOfSeasons;i++){
        (function(i, getEpisodesRatings){
        var url=omdbPrefix+"?t="+series+"&Season="+i+"&apikey="+process.env.REACT_APP_OMDB_KEY;
        var getSeasonEpisodes=axios.get(url).then(result=>{
          seasons[i-1]=getEpisodesRatings(result.data, i);
          //console.log("season "+i+" rating: "+seasons[i-1]);
        },error=>{
          //deal with error.
        });
        promises.push(getSeasonEpisodes);
      })(i,this.getEpisodesRatings);

    }
    Promise.all(promises).then(results=>{
      this.setState({disabled:false, loading:false});
      var data={title:series ,seasons};
      this.addSeriesToFirebase(series.toLowerCase(), data);
      this.props.updateMethod(series, seasons);
      window.history.pushState({}, series+" Ratings", "/"+series);
      
    },error=>{
        this.setState({disabled:false, error: true, loading:false, errorMsg: "Can't access the server. Please try again later."});
        return;
    });
  }

  getEpisodesRatings(data, seasonNum){
    var ratings=[];
    var episodes=data.Episodes;
    for(var i=1;i<=episodes.length;i++){
      var rating=parseFloat(episodes[i-1].imdbRating);
      if(!isNaN(rating))
        ratings.push({name: episodes[i-1].Title, rating: rating, season: seasonNum, episode: i});
    }
    //console.log("ratings: "+ratings)
    return ratings;
  }

  addSeriesToFirebase(series, data){
    database.ref(series).set(data);
  }

}

export default SearchBox;