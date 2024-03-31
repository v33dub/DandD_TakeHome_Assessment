import thumbnail from '../assets/images/icon_Combatant.png';
import './Combatant.css';

function Combatant(props) {
    return (
        <div className="combatant">
            <img alt="hooded rogue" src={thumbnail} />
            <p>{props.name}</p>
        </div>
    );
}

export default Combatant;