import React, { Component } from 'react';

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

export default Suggestions;
