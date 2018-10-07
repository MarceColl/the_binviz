const React = require('react')
const RegionSelector = require('./region_selector')
const Vis3D = require('./3d_vis')
const ImageSearch = require('./image_searcher')
const Menu = require('./menu')
const config = require('../config')

class App extends React.Component {
    constructor(props) {
        super(props)

        this.onModeChange = this.onModeChange.bind(this)
    }

    componentDidMount() {
    }

    onModeChange() {
        this.forceUpdate()
    }

    render() {
        let viz

        if (config.current_viz === 'ngram') {
            viz = <Vis3D />
        }
        else if (config.current_viz === 'structure') {
            viz = <ImageSearch />
        }

        return (
            <>
            <RegionSelector />
            <div id="vis">
                { viz }
            </div>
            <Menu onModeChange={this.onModeChange} />
            </>
        )
    }
}

module.exports = App