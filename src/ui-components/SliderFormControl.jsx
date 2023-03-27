import { FormControl } from "baseui/form-control";
import { Block } from "baseui/block";
import InfoToolTip from "./InfoToolTip";

export default function SliderFormControl({
  label,
  infoToolTipContent,
  caption,
  slider,
}) {
  return (
    <Block flex={1}>
      <FormControl
        label={
          <>
            {label}
            <InfoToolTip infoToolTipContent={infoToolTipContent} />
          </>
        }
        caption={caption}
        overrides={{
          Caption: {
            style: () => ({
              marginTop: "0",
            }),
          },
          Label: {
            style: () => ({
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }),
          },
        }}
      >
        {slider}
      </FormControl>
    </Block>
  );
}
