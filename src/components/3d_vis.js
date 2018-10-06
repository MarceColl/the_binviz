const React = require('react')

class Vis3D extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <canvas id="3d_vis"></canvas>
        )
    }
}

module.exports = Vis3D