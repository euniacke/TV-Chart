import React, { Component } from 'react';
import axios from 'axios';
import jsonp from 'jsonp';
import { LineChart, Line,ResponsiveContainer, YAxis, XAxis, Tooltip, Label, ReferenceLine } from 'recharts';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './App.css';
import puff from './puff.svg';

const websiteName="TV Chart";
const omdbPrefix= "https://www.omdbapi.com/";


class Header extends Component{
  constructor(props){
    super(props);
    this.goToHomePage=this.goToHomePage.bind(this);
  }

  render(){
    return(
    <nav className="navbar navbar-dark bg-dark justify-content-end">
        <a className="clickable navbar-brand mr-auto text-white segoe" onClick={this.goToHomePage}>{websiteName}</a>
        <SeasonSelector numOfSeasons={this.props.numOfSeasons} changeSeason={this.props.changeSeason} showSeason={this.props.showSeason}/>
        <SearchBox updateMethod={this.props.updateMethod} series={this.props.series} pathname={this.props.pathname}/>               
    </nav>
    );
  }

  goToHomePage(){
    this.props.updateMethod("", []);
  }
}

class Suggestions extends Component{
  constructor(props){
    super(props);
    this.state={
      index: 0,
      visible:true
    }
    this.shows=["Game of Thrones", "Dexter", "The Office", "Rick and Morty", "Stranger Things", 
    "The Walking Dead","House of Cards","Westworld","True Detective","Black Mirror", "Breaking Bad", "South Park"];
    this.shuffle(this.shows);
    this.handleClick=this.handleClick.bind(this);
    this.changeSuggestion=this.changeSuggestion.bind(this);
  }

  render(){
    var link=<strong><a className={"clickable fade "+ (this.state.visible? "show": "hide")} onClick={this.handleClick}>{" "+this.shows[this.state.index]}</a></strong>; 
    return(
      <div className="suggestions text-white mt-3">
      Or try: 
      {link}
      </div>
      );
  }

  handleClick(){
    this.props.handleClick(this.shows[this.state.index]);
  }

  changeSuggestion(){
    this.setState(function(prevState){
      setTimeout(()=>{
        this.setState({index:(this.state.index+1) % this.shows.length, visible:true});
      },500);
      return {visible:false};
    });
  }

  componentDidMount(){
    this.timer=setInterval(this.changeSuggestion, 4000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
  }
}

class ErrorModal extends Component{
   constructor(props) {
    super(props);
  }

  render(){
    return(
        <Modal isOpen={this.props.open} toggle={this.props.toggle} centered={true}>
          <ModalBody>
            {this.props.errorMsg}
          </ModalBody>
          <ModalFooter>
            <Button color="info" onClick={this.props.toggle}>Okay</Button>{' '}
          </ModalFooter>
        </Modal>
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
    <p id="yAxisLabel"> Rating </p>
    <p id="xAxisLabel"> Episode </p>
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
        <Header updateMethod={this.props.updateMethod} numOfSeasons={this.props.seasons.length} changeSeason={this.changeSeason} series={this.props.series} showSeason={this.state.showSeason} pathname={this.props.pathname}/>
        <h1 className="display-4 text-white text-center">{this.props.series}: {this.state.showSeason == 0 ? "All Episodes": "Season "+this.state.showSeason}</h1>
        <Graph series={this.props.series} seasonRatings={this.props.seasons} showSeason={this.state.showSeason}></Graph>
        <About/>
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
}

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    return (
      <div id="about" onClick={this.toggle}>
        <a className="clickable">About</a>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>About TV Chart</ModalHeader>
          <ModalBody>
            TV Chart lets you view a chart of any TV show's rating, by episode.<br/><br/>
            Made by Benjamin M. Contact me: benmiz96@gmail.com<br/><br/>
            Data is taken from <a href="http://www.omdbapi.com">OMDb API</a>.<br/>
            Chart is powered by <a href="http://recharts.org">Recharts</a>.<br/>
            Inspired by (the now inoperational) <a href="http://graphtv.kevinformatics.com/">Graph-TV</a>.

            </ModalBody>
        </Modal>
      </div>
    );
  }
}

class HomeScreen extends Component{
  constructor(props){
    super(props);
    this.state={visible:false};
  }

  render(){
      return (
      <div id="homeScreenContainer" className={"container-fluid d-flex flex-column align-items-center bg-dark"+ (this.state.visible? " show":" hide")}>
        <div className="centerContainer d-flex flex-column align-items-center">
          <h1 className="display-2 text-white mx-auto">{websiteName}</h1><br/>
          <SearchBox updateMethod={this.props.updateMethod} wide={true} pathname={""}/>
        </div>
        <About/>
      </div>
      );
  }

  componentDidMount(){
    this.setState({visible: true});
  }

}

class App extends Component {
  constructor(props){
    super(props);
    var pathname= window.location.pathname.slice(1);
    //console.log(process.env);
    this.state={series: "", loadedSeasons: 0, numOfSeasons: 0, pathname:pathname, seasons: []};
    this.updateSeries=this.updateSeries.bind(this);
  }

  render() {
    if(this.state.series=="" && this.state.pathname=="")
      return <HomeScreen updateMethod={this.updateSeries}/>;  
    else
      return <GraphView updateMethod={this.updateSeries} series={this.state.series} seasons={this.state.seasons} pathname={this.state.pathname}/>;

    
  }

  updateSeries(series, seasons){
    this.setState({series:series, seasons:seasons, pathname:""});
  }

}

export default App;
