const React = require('react')
const RegionSelector = require('./region_selector')
const Vis3D = require('./3d_vis')
const ImageSearch = require('./image_searcher')
const Menu = require('./menu')

class App extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
    }

    render() {
        return (
            <>
            <RegionSelector />
            <div id="vis">
                <ImageSearch />
            </div>
            <Menu />
            </>
        )
    }
}

module.exports = App