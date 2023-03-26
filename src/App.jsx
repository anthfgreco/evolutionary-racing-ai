import { useState } from "react";
import MainSketch from "./p5js-components/MainSketch";
import { Slider } from "baseui/slider";
import { FormControl } from "baseui/form-control";
import { useStyletron } from "baseui";
import { Grid, Cell } from "baseui/layout-grid";
import { Block } from "baseui/block";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";

function App() {
  const [css, theme] = useStyletron();
  const [mutationProbability, setMutationProbability] = useState(0.1);
  const [mutationAmount, setMutationAmount] = useState(0.5);

  const genesMutated = Math.round(mutationProbability * 68);
  const mutationProbabilityCaption = `${genesMutated} out of 68 car genes will be mutated`;

  const mutationAmountString = Math.round(mutationAmount * 100);
  const mutationAmountCaption = `Each mutated gene will be changed by ${mutationAmountString}%`;

  console.log("mutationProbability: ", mutationProbability);
  console.log("mutationAmount: ", mutationAmount);

  return (
    <div className="App">
      <MainSketch
        mutationProbability={mutationProbability}
        mutationAmount={mutationAmount}
      />

      <Block
        width={["100%", "100%", "600px"]} // see https://baseweb.design/components/block/#responsive-layouts
        backgroundColor={"limegreen"}
        display={"inline-flex"}
      >
        <Block flex={1}>
          <FormControl
            label={() => "Mutation Probability (%)"}
            caption={() => mutationProbabilityCaption}
          >
            <Slider
              value={[mutationProbability * 100]}
              onChange={({ value }) =>
                value && setMutationProbability(value[0] / 100)
              }
              min={0}
              max={100}
              step={1}
              valueToLabel={(value) => `${Math.round(value)}%`}
              width="100%"
            />
          </FormControl>
        </Block>
        <Block flex={1}>
          <FormControl
            label={() => "Mutation Amount (%)"}
            caption={() => mutationAmountCaption}
          >
            <Slider
              value={[mutationAmount * 100]}
              onChange={({ value }) =>
                value && setMutationAmount(value[0] / 100)
              }
              min={0}
              max={100}
              valueToLabel={(value) => `${Math.round(value)}%`}
            />
          </FormControl>
        </Block>
      </Block>
    </div>
  );
}

export default App;
