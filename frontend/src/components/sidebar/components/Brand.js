import React from "react";

// Chakra imports
import { Flex, Heading, useColorModeValue } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import Icon from "../../icons/reKyndle (1).png";
// Custom components
import { HorizonLogo } from "components/icons/Icons";
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");

  return (
    <Flex align="center" direction="column">
      {/* <HorizonLogo h='26px' w='175px' my='32px' color={logoColor} /> */}
      <Image
        src={Icon}
        h="60px"
        w="150px"
        my="4px"
        marginLeft={"-10px"}
        color={logoColor}
      />
      {/* <Heading type="brand" size="lg" color={logoColor}>
        reKyndle
      </Heading> */}

      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
