import React, { Component } from 'react';
import Header from './Header';
import Graph from './Graph';
import About from './About';

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

export default GraphView;