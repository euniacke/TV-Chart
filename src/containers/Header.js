import React, { Component } from 'react';
import SearchBox from './SearchBox';
import SeasonSelector from './SeasonSelector';

class Header extends Component{
  constructor(props){
    super(props);
    this.goToHomePage=this.goToHomePage.bind(this);
  }

  render(){
    return(
    <nav className="navbar navbar-dark bg-dark justify-content-end">
        <a
        className="clickable navbar-brand mr-auto text-white segoe"
        onClick={this.goToHomePage}>
          TV Chart
        </a>
        <SeasonSelector numOfSeasons={this.props.numOfSeasons}
        changeSeason={this.props.changeSeason} showSeason={this.props.showSeason}/>
        <SearchBox
        updateMethod={this.props.updateMethod}
        series={this.props.series}
        pathname={this.props.pathname}
        />               
    </nav>
    );
  }


  goToHomePage(){
    this.props.updateMethod("", []);
  }
}

export default Header;