import { Block } from "baseui/block";
import { Tag, KIND, VARIANT } from "baseui/tag";
import { LabelSmall } from "baseui/typography";

function InfoItem({ label, value, marginLeft }) {
  return (
    <Block
      display="flex"
      flexDirection={["column", "column", "row"]}
      alignItems="center"
      marginLeft={marginLeft}
      gridGap="5px"
    >
      <LabelSmall
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "24px",
        }}
      >
        {label}:
      </LabelSmall>

      <Tag closeable={false} kind={KIND.neutral} variant={VARIANT.solid}>
        {value}
      </Tag>
    </Block>
  );
}

export default InfoItem;
