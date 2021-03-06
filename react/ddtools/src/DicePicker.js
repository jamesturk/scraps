import React, { Component } from 'react';

// map degrees-of-freedom (sides-1) to 90, 95, 97.5 and 99% thresholds
const CHI_SQUARED_CRITICAL = {
  3: [6.251, 7.815, 9.348, 11.345],
  5: [9.236, 11.070, 12.833, 15.086],
  7: [12.017, 14.067, 16.013, 18.475],
  9: [14.684, 16.919, 19.023, 21.666],
  11: [17.275, 19.675, 21.920, 24.725],
  19: [27.204, 30.144, 32.852, 36.191],
}

class ChiSquaredGraph extends Component {
  render() {
    var width = this.props.width;
    var data = CHI_SQUARED_CRITICAL[this.props.n-1];
    data.push(data[3] + 5);
    var scale = width / data[4];
    var color = ["green", "yellow", "orange", "red", "darkred"];
    var last = 0;
    var rects = [];

    for(var i=0; i < data.length; i++) {
      rects.push(
      <g transform={"translate(" + scale*last + ", 0)"}>
       <rect width={(data[i]-last)*scale} height="40" fill={color[i]} />
       <text y="55" fill="black">{i > 0 ? data[i-1].toFixed(1) : ""}</text>
      </g>
      );

      last = data[i];
    }

    rects.push(
      <g transform={"translate(" + scale*this.props.chi + ", 0)"}>
       <rect width="2" height="50" fill="blue" />
       <text y="55" fill="black">{this.props.chi.toFixed(2)}</text>
      </g>
    )

    return (
      <div><svg width={width} height="100">
      {rects}
      </svg></div>
    );
  }
}

class DiceTableRow extends Component {
  render() {
    return (
      <tr>
        <td><button name={this.props.n} onClick={this.props.click}>{this.props.n+1}</button></td>
        <td><input data-n={this.props.n} value={this.props.count} onChange={this.props.onChange}/></td>
        <td><div className="diceNumBar" style={{width: this.props.percent || 0}}></div></td>
      </tr>
    );
  }
}

class DiceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.onChange = this.onChange.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    var counts = Array(parseInt(nextProps.numSides, 10)).fill(0);
    return {'counts': counts, 'expected': 0, 'chiSquared': 0, 'total': 0};
  }

  renderRow(i) {
    return (<DiceTableRow n={i} 
       count={this.state.counts[i]}
       percent={this.state.counts[i] / this.state.total * 100}
       click={() => this.click(i)}
       onChange={this.onChange}
       key={i}
       />);
  }

  render() {
    var rows = [];
    for(var i=0; i < this.props.numSides; i++) {
      rows.push(this.renderRow(i));
    }
    return (
      <div className="diceTable">
      <table>
        <thead>
          <tr><th>#</th><th>count</th><th>&nbsp;</th></tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      <div className="diceSummary">
        Computed a &Chi;<sup>2</sup> of <i>{this.state.chiSquared.toFixed(2)}</i>. Probability of bad dice <i>{this.chiSquaredPassage()}</i>
        <ChiSquaredGraph n={this.props.numSides} width={700} chi={this.state.chiSquared} />
      </div>
      </div>
    );
  }

  updateStats(newState) {
    newState.total = 0;
    for(var count of this.state.counts) {
      newState.total += count;
    }

    newState.expected = this.state.total / this.props.numSides;
    newState.chiSquared = 0;

    for(count of this.state.counts) {
      newState.chiSquared += (count - newState.expected) ** 2 / newState.expected;
    }
  }

  click(i) {
    var newState = this.state;
    newState.counts[i]++;
    this.updateStats(newState);
    this.setState(newState);
  }

  onChange(e) {
    var newState = this.state;
    newState.counts[e.target.dataset.n] = parseInt(e.target.value, 10);
    this.updateStats(newState);
    this.setState(newState);
  }

  chiSquaredPassage() {
    var table = CHI_SQUARED_CRITICAL[this.props.numSides-1];
    var chiVal = this.state.chiSquared;

    if(chiVal < table[0]) {
      return '<90%';
    } else if(chiVal < table[1]) {
      return '90-95%';
    } else if(chiVal < table[2]) {
      return '95-97.5%';
    } else if(chiVal < table[3]) {
      return '97.5-99%';
    } else {
      return '>99%';
    }
  }
}

class DicePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {numSides: "4"};

    this.onChange = this.onChange.bind(this);
  }

  render() {
    var numbers = ['4', '6', '8', '10', '12', '20'];
    var options = [];

    for(var n of numbers) {
      options.push(
        <React.Fragment key={n}>
          <input type="radio" name="numSides" value={n} id={'ns' + n}
           checked={this.state.numSides === n} onChange={this.onChange} />
          <label htmlFor={'ns' + n}>d{n}</label>
        </React.Fragment>
        );
    }

    return (
      <div className="diceTester">
        <div className="dicePicker">
        {options}
        </div>

        <DiceTable numSides={this.state.numSides} />
      </div>
    )
  }

  onChange(e) { 
    this.setState({numSides: e.target.value});
  }
}

export default DicePicker;