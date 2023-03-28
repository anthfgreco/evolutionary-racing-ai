import { Block } from "baseui/block";
import { ButtonGroup, MODE } from "baseui/button-group";
import { Button } from "baseui/button";

function RadioButtonGroup({ selectedButtonIndex, setSelectedButtonIndex }) {
  return (
    <Block position="absolute" left="50px" top="-20px">
      <ButtonGroup
        mode={MODE.radio}
        selected={selectedButtonIndex}
        onClick={(event, index) => {
          setSelectedButtonIndex(index);
        }}
      >
        <Button>Exploration 🔍</Button>
        <Button>Exploitation 🔧</Button>
      </ButtonGroup>
    </Block>
  );
}

export default RadioButtonGroup;
