import { useState, useEffect } from "react";
import { Slider } from "baseui/slider";
import { Block } from "baseui/block";
import { Card } from "baseui/card";
import { ParagraphMedium } from "baseui/typography";
import { DisplayXSmall } from "baseui/typography";
import Sketch from "./p5js-components/Sketch";
import InfoBanner from "./ui-components/InfoBanner";
import SliderFormControl from "./ui-components/SliderFormControl";
import RadioButtonGroup from "./ui-components/RadioButtonGroup";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { LAYER_SIZES } from "./constants";

//let tableData = [];

let TOTAL_WEIGHTS = 0;

// Loop through the layers and calculate the weights between current layer and next layer
for (let i = 0; i < LAYER_SIZES.length - 1; i++) {
  TOTAL_WEIGHTS += LAYER_SIZES[i] * LAYER_SIZES[i + 1];
}

function App() {
  const [mutationProbability, setMutationProbability] = useState(0.1);
  const [mutationAmount, setMutationAmount] = useState(0.5);
  const [populationSize, setPopulationSize] = useState(100);
  const [timePerGeneration, setTimePerGeneration] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(timePerGeneration);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const [generationNum, setGenerationNum] = useState(1);

  /*
  This one line increases the speed of the simulation by 5-10x.
  WASM is dramatically faster than webgl (and cpu) in this case because my models are extremely small and
  the overhead of transferring data to the GPU is surprisingly large.
   */
  useEffect(() => {
    tf.setBackend("wasm");
  }, []);

  useEffect(() => {
    // exploration
    if (selectedButtonIndex === 0) {
      setMutationProbability(0.4);
      setMutationAmount(0.75);
      setTimePerGeneration(5);
      // exploitation
    } else {
      setMutationProbability(0.1);
      setMutationAmount(0.3);
      setTimePerGeneration(15);
    }
  }, [selectedButtonIndex]);

  // function addData(bestFitness) {
  //   //tableData.push([generationNum, bestFitness]);
  //   tableData = [[generationNum, bestFitness], ...tableData];
  // }

  const genesMutated = Math.round(mutationProbability * TOTAL_WEIGHTS);
  const mutationProbabilityCaption = `${genesMutated} out of ${TOTAL_WEIGHTS} car genes will be mutated.`;

  const mutationAmountString = Math.round(mutationAmount * 100);
  const mutationAmountCaption = `Each mutated gene will be changed by ${mutationAmountString}%.`;

  return (
    <div className="App">
      <Block width="100%" display="flex" justifyContent="center">
        <DisplayXSmall marginBottom="scale900">
          Evolutionary Racing AI
        </DisplayXSmall>
      </Block>

      <Sketch
        {...{
          populationSize,
          mutationProbability,
          mutationAmount,
          timePerGeneration,
          timeRemaining,
          setTimeRemaining,
          totalTime,
          setTotalTime,
          generationNum,
          setGenerationNum,
          // addData,
        }}
      />

      <Block
        width={["100%", "100%", "1000px"]} // see https://baseweb.design/components/block/#responsive-layouts
      >
        <InfoBanner
          {...{
            generationNum,
            timeRemaining,
            totalTime,
          }}
        />

        <Block position="relative">
          <Card
            overrides={{
              Root: {
                style: () => ({
                  outlineColor: "black",
                  outlineStyle: "solid",
                  outlineWidth: "2px",
                  marginTop: "50px",
                  marginRight: "20px",
                  marginBottom: "20px",
                  marginLeft: "20px",
                  paddingTop: "20px",
                }),
              },
            }}
          >
            <RadioButtonGroup
              selectedButtonIndex={selectedButtonIndex}
              setSelectedButtonIndex={setSelectedButtonIndex}
            />

            <ParagraphMedium>
              Exploration introduces diversity into the population. Use it at
              the beginning of training or if the AI is stuck on a difficult
              turn.
            </ParagraphMedium>

            <ParagraphMedium>
              Exploitation fine-tunes the best performing cars.
            </ParagraphMedium>

            <FlexGrid
              width="100%"
              flexGridColumnCount={[1, 1, 2]}
              flexGridColumnGap="scale800"
              flexGridRowGap="scale400"
            >
              <FlexGridItem>
                <SliderFormControl
                  label={"Mutation Probability (%)"}
                  infoToolTipContent={[
                    "Determines the likelihood that a gene will mutate.",
                    "🔼 Higher mutation probability ➡ large changes to the car's neural network",
                    "🔽 Lower mutation probability ➡ fewer changes and slower evolution",
                  ]}
                  caption={mutationProbabilityCaption}
                  slider={
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
                  }
                />
              </FlexGridItem>
              <FlexGridItem>
                <SliderFormControl
                  label={"Mutation Amount (%)"}
                  infoToolTipContent={[
                    "Determines the amount that a gene will mutate.",
                    "🔼 Higher mutation amount ➡ large changes to the car's neural network",
                    "🔽 Lower mutation amount ➡ fewer changes and slower evolution",
                  ]}
                  caption={mutationAmountCaption}
                  slider={
                    <Slider
                      value={[mutationAmount * 100]}
                      onChange={({ value }) =>
                        value && setMutationAmount(value[0] / 100)
                      }
                      min={0}
                      max={100}
                      valueToLabel={(value) => `${Math.round(value)}%`}
                    />
                  }
                />
              </FlexGridItem>
              <FlexGridItem>
                <SliderFormControl
                  label={"Population Size"}
                  infoToolTipContent={[
                    "Determines the number of cars in the population.",
                    "🔼 Higher population size ➡ quicker to find a solution but computationally expensive",
                    "🔽 Lower population size ➡ slower to find a solution",
                  ]}
                  caption={""}
                  slider={
                    <Slider
                      value={[populationSize]}
                      onChange={({ value }) =>
                        value && setPopulationSize(value[0])
                      }
                      min={50}
                      max={1000}
                      step={1}
                      valueToLabel={(value) => `${value}`}
                    />
                  }
                />
              </FlexGridItem>
              <FlexGridItem>
                <SliderFormControl
                  label={"Time Per Generation (s)"}
                  infoToolTipContent={[
                    "Determines the amount of time each generation will run for.",
                    "🔼 Higher time per generation ➡ able to learn entire track but takes longer to evolve",
                    "🔽 Lower time per generation ➡ able to learn small sections of track but evolves faster",
                  ]}
                  caption={""}
                  slider={
                    <Slider
                      value={[timePerGeneration]}
                      onChange={({ value }) =>
                        value && setTimePerGeneration(value[0])
                      }
                      min={5}
                      max={60}
                      step={1}
                      valueToLabel={(value) => `${value}s`}
                    />
                  }
                />
              </FlexGridItem>
            </FlexGrid>
          </Card>
        </Block>

        {/* <Table
          columns={["Generation", "Fitness"]}
          data={tableData}
          size={SIZE.compact}
          divider={DIVIDER.vertical}
          overrides={{
            Root: {
              style: {
                maxHeight: "300px",
                maxWidth: "300px",
                margin: "20px",
              },
            },
          }}
        /> */}
      </Block>
    </div>
  );
}

export default App;
