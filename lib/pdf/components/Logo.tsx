/* eslint-disable jsx-a11y/alt-text */
import { Image, View } from "@react-pdf/renderer";
import { mailConfig } from "@/lib/mail/config";

type LogoProps = {
    width?: number;
};

export function Logo({
    width = 160,
}: LogoProps) {
    return (
        <View
            style={{
                alignItems: "center",
                marginBottom: 24,
            }}
        >
            <Image
                src={`${mailConfig.appUrl}/images/logo/logo-execorner.png`}
                style={{
                    width,
                }}
            />
        </View>
    );
}