import React, { Component } from 'react';

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

export default SeasonSelector;