export const platformSelector = (platform: string) => {
    switch (platform.toLowerCase()) {
        case "nes":
            return "nes-games";
        case "snes":
            return "snes-games";
        case "gameboy":
            return "gameboy-games";
        case "gameboy colour":
            return "gameboycolor-games";
        case "gameboy colour":
            return "gameboycolor-games";
        case "gameboy advance":
            return "gameboyadvance-games";
        case "n64":
            return "n64-games"
        case "nds":
            return "nds-games";
        case "master system":
            return "mastersystem-games";
        case "gamegear":
            return "gamegear-games";
        case "genesis":
            return "genesis-games";
        case "32x":
            return "sega32x-games";
        case "segacd-games":
            return "segacd-games";
        case "turbografx 16":
            return "turbografx16-games";
        case "turbografx cd":
            return "turbografxcd-games";
        case "pc engined cd":
            return "pcecd-games";
        case "atari 7800":
            return "atari7800-games";
        case "lynx":
            return "lynx-games";
        case "jaguar":
            return "jaguar-games";
        case "playstation":
            return "psx-games";
        case "arcade":
            return "arcade-games";
        case "wonderswan":
            return "wonderswan-games";
        case "neo geo pocket":
            return "ngp-games";
        case "msx":
            return "msx1-games";
        case "msx 2":
            return "msx2-games";
        default:
            break;
    }
};

export const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
}