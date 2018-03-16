import React, { Component } from 'react';
import axios from 'axios';
import { LineChart, Line,ResponsiveContainer, YAxis, XAxis, Tooltip, Label, ReferenceLine } from 'recharts';
import './App.css';

const websiteName="TV Rating Graph";

class Header extends Component{
  render(){
    return(
    <nav className="navbar navbar-dark bg-dark justify-content-end">
        <a className="navbar-brand mr-auto text-white segoe">{websiteName}</a>
        <SeasonSelector numOfSeasons={this.props.numOfSeasons} changeSeason={this.props.changeSeason} showSeason={this.props.showSeason}/>
        <SearchBox updateMethod={this.props.updateMethod} series={this.props.series}/>               
    </nav>
    );
  }
}

class ProgressBar extends Component{
  render(){
    var percent;
    if(this.props.numOfSeasons == 0)
      percent=0;
    else
      percent = Math.floor((this.props.loadedSeasons / this.props.numOfSeasons)*100);
    percent+="%";
    return(
      <div className="progress mb-2 w-100" style={{height: '5px'}}>
        <div className="progress-bar" role="progressbar" style={{width: percent}}></div>
      </div>
      );
  }
}

class SeasonSelector extends Component{
  constructor(props){
    super(props);
    this.state={value: 0};
    this.handleChange=this.handleChange.bind(this);
  }

  render(){
    var options=[];
    options.push(<option value={0}>All seasons</option>);
    for(var i=1;i<=this.props.numOfSeasons;i++){
      options.push(<option value={i}>Season {i}</option>);
    }
    return(
        <form className="mr-2">
          <select className="form-control-sm" value={this.state.value} onChange={this.handleChange}>
          {options}
          </select>
        </form>
      );
  }

  handleChange(event){
    this.setState({value: event.target.value});
    this.props.changeSeason(event.target.value);
  }

  componentWillReceiveProps(nextProps){
    if(this.props!==nextProps)
      this.setState({value: nextProps.showSeason});
  }

}

class Graph extends Component {
  render() {
    var episodeRatings;
    if(this.props.showSeason == 0)
      episodeRatings=[].concat.apply([], this.props.seasonRatings);
    else
      episodeRatings=this.props.seasonRatings[this.props.showSeason-1];
    for(var i=0;i<episodeRatings.length;i++){
      episodeRatings[i].episodeNum=i+1;
    }
    return (
    <div id="graphContainer" className="container-fluid">
  	<ResponsiveContainer className="chart" width="95%" height={700}>
        <LineChart data={episodeRatings}>
          <Line type="monotone" dataKey="rating" stroke="#8884d8" nameKey="name" strokeWidth={2} stroke="#32c17e"/>
          <Tooltip labelFormatter={(num)=> {
            var episode=episodeRatings[num-1];
            if(episode!==undefined)
              return "S"+episode.season+"E"+episode.episode+": "+episode.name;
            else
              return "Loading";
          }}/>
          <XAxis dataKey="episodeNum" padding={{ left: 10 }} stroke="#dce5ed" />
          <YAxis type="number" domain={[dataMin=> Math.floor(dataMin), dataMax=> Math.ceil(dataMax)]} allowDecimals={false} stroke="#dce5ed"/>
          {this.getReferenceLines(this.props.seasonRatings)}
        </LineChart>
  	</ResponsiveContainer>
    <p id="xAxisLabel"> Rating </p>
    </div>
    );
  }

  getReferenceLines(seasons){
    if(seasons== undefined)
      return;
    if(this.props.showSeason!=0)
      return [];
    var referenceLines=[];
    referenceLines.push(<ReferenceLine x={1} strokeDasharray="5 5" stroke="#678296"/>);
    var seasonsStart=1;
    for(var i=0;i<seasons.length-1;i++){
      var seasonsStart=seasonsStart+seasons[i].length;
      referenceLines.push(<ReferenceLine x={seasonsStart} strokeDasharray="5 5" stroke="#678296"/>);

    }
    return referenceLines;
  }

}

class GraphView extends Component {
  constructor(props){
    super(props);
    this.state={showSeason: 0, visible: false};
    this.changeSeason=this.changeSeason.bind(this);
  }

  render() {
    return(
      <div className={"App"+ (this.state.visible? " show":" hide")}>
        <Header updateMethod={this.props.updateMethod} numOfSeasons={this.props.seasons.length} changeSeason={this.changeSeason} series={this.props.series} showSeason={this.state.showSeason}/>
        <h1 class="display-4 text-white text-center">{this.props.series}: {this.state.showSeason == 0 ? "All Episodes": "Season "+this.state.showSeason}</h1>
        <Graph series={this.props.series} seasonRatings={this.props.seasons} showSeason={this.state.showSeason}></Graph>
      </div>
    );
  }

  changeSeason(seasonNum){
    this.setState({showSeason: seasonNum});
    
  }

  componentWillReceiveProps(nextProps){
    if(this.props!=nextProps)
      this.setState({showSeason:0});
  }

  componentDidMount(){
    this.setState({visible: true});
  }

}

class SearchBox extends Component{
  constructor(props){
    super(props);
    this.state={value: this.props.series? this.props.series:"" , disabled:false};
    this.handleChange=this.handleChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
  }

  render(){
    return (
    <form className="form-inline" onSubmit={this.handleSubmit}>
      <input id={this.props.wide? "wideInput": "navInput"} className="form-control mr-sm-2" type="search" placeholder="Search for a TV show" value={this.state.value} aria-label="Search" onChange={this.handleChange} disabled={this.state.disabled}/>
      <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form>
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
    if(this.props.pathname != ""){
      this.setState({value: this.props.pathname});
      this.updateRatings(this.props.pathname);
    }
    
  }

  updateRatings(series){
    var url="http://www.omdbapi.com/?t="+series+"&type=series&apikey="+process.env.REACT_APP_OMDB_KEY;

    axios.get(url).then(result=>{
      if(result.data.Title===undefined || result.data.totalSeasons== "N/A"){
        this.setState({disabled:false});
        return;
      }
      this.getSeasons(result.data.Title, parseInt(result.data.totalSeasons));
    },error=>{
      //deal with error.
    });

  }

  getSeasons(series,numOfSeasons){
    const seasons=[];
    var promises=[];
    for(var i=1;i<=numOfSeasons;i++){
        (function(i, getEpisodesRatings){
        var url="http://www.omdbapi.com/?t="+series+"&Season="+i+"&apikey="+process.env.REACT_APP_OMDB_KEY;
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
      this.props.updateMethod(series, seasons);
      window.history.pushState({}, series+" Ratings", "/"+series);
      this.setState({disabled:false});
    })
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
}

class HomeScreen extends Component{
  render(){

      return (
      <div id="homeScreenContainer" className="container-fluid d-flex flex-column align-items-center bg-dark">
        <div className="centerContainer d-flex flex-column align-items-center">
          <h1 className="display-2 text-white mx-auto">{websiteName}</h1><br/>
          <SearchBox updateMethod={this.props.updateMethod} wide={true} pathname={this.props.pathname}/>
        </div>
      </div>
      );
  }
}

class App extends Component {
  constructor(props){
    super(props);
    var pathname= window.location.pathname.slice(1);
    console.log(process.env);
    this.state={series: "", loadedSeasons: 0, numOfSeasons: 0, pathname:pathname};
    this.updateSeries=this.updateSeries.bind(this);
  }

  render() {
    if(this.state.series=="")
      return <HomeScreen updateMethod={this.updateSeries} pathname={this.state.pathname}/>;  
    else
      return <GraphView updateMethod={this.updateSeries} series={this.state.series} seasons={this.state.seasons}/>;
    
  }

  updateSeries(series, seasons){
    this.setState({series:series, seasons:seasons});
  }

}

export default App;
