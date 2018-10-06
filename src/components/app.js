const React = require('react')
const RegionSelector = require('./region_selector')
const Vis3D = require('./3d_vis')
const Menu = require('./menu')

class App extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <>
            <RegionSelector />
            <div id="vis">
                <Vis3D />
            </div>
            <Menu />
            </>
        )
    }
}

module.exports = App