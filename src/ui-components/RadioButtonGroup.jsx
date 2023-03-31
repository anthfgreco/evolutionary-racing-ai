import { Block } from "baseui/block";
import { ButtonGroup, MODE } from "baseui/button-group";
import { Button } from "baseui/button";
import { Card } from "baseui/card";

function RadioButtonGroup({ selectedButtonIndex, setSelectedButtonIndex }) {
  return (
    <Block position="absolute" left="50px" top="-40px">
      <Card
        overrides={{
          Root: {
            style: () => ({
              borderTopStyle: "none",
              borderRightStyle: "none",
              borderBottomStyle: "none",
              borderLeftStyle: "none",
            }),
          },
        }}
      >
        <ButtonGroup
          mode={MODE.radio}
          selected={selectedButtonIndex}
          onClick={(event, index) => {
            setSelectedButtonIndex(index);
          }}
          overrides={{
            Root: {
              style: () => ({
                gap: "6px",
              }),
            },
          }}
        >
          <Button>Exploration 🔍</Button>
          <Button>Exploitation 🔧</Button>
        </ButtonGroup>
      </Card>
    </Block>
  );
}

export default RadioButtonGroup;
