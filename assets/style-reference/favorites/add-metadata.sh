#!/bin/bash
# Metadata tagging script for Tithi Luadthong (Grandfailure) art
# Artist: Tithi Luadthong (Grandfailure)
# Source: Various (Shutterstock, Bored Panda)

cd ~/Documents/sparc-rpg/assets/style-reference/favorites/

# tiffy_01.jpg - Dragon confrontation
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Dragon Confrontation" \
  -Description="Mage with staff confronting massive dragon through glowing portal on cliff edge" \
  -Keywords="dragon,mage,portal,magic circle,confrontation,cliff,silhouette,epic,dark,mystical,cinematic,fantasy" \
  "tiffy_01.jpg"

# tiffy_02.jpg - Apocalyptic levitation
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Apocalyptic Ascension" \
  -Description="Solitary figure levitating with arms outstretched above burning cityscape at sunset" \
  -Keywords="levitation,apocalyptic,cityscape,destruction,fire,sunset,transcendence,dramatic,ominous,cinematic" \
  "tiffy_02.jpg"

# tiffy_03.jpg - Sky whale
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Sky Whale" \
  -Description="Massive ethereal whale floating above city skyline against cosmic sunset sky" \
  -Keywords="sky whale,cosmic,cityscape,surreal,ethereal,sunset,nebula,dreamlike,majestic,wonder,fantasy" \
  "tiffy_03.jpg"

# tiffy_04.jpg - Samurai memorial
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Samurai Memorial" \
  -Description="Solitary samurai in flower field with swords planted as grave markers, falling petals" \
  -Keywords="samurai,ronin,battlefield memorial,katana,flowers,petals,melancholic,Japanese,contemplative,fantasy" \
  "tiffy_04.jpg"

# tiffy_05.jpg - Star trail vortex
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Star Vortex Journey" \
  -Description="Lone figure in rowboat beneath massive spiral star trail portal over calm water" \
  -Keywords="star trail,portal,boat,cosmic,seascape,solitary,contemplative,vortex,ethereal,journey,fantasy" \
  "tiffy_05.jpg"

# tiffy_06.jpg - Fire serpent summoning
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Fire Serpent Summoning" \
  -Description="Cloaked figure summoning massive fire serpent creature with glowing orb" \
  -Keywords="summoning,fire serpent,dragon,magic,flames,confrontation,cloaked figure,ominous,intense,fantasy" \
  "tiffy_06.jpg"

# tiffy_07.jpg - Floating jellyfish spirits
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Spirit Jellyfish Night" \
  -Description="Two figures on hilltop watching luminescent floating jellyfish spirits in night sky" \
  -Keywords="jellyfish,spirits,bioluminescent,night sky,bicycle,silhouette,dreamlike,ethereal,wonder,fantasy" \
  "tiffy_07.jpg"

# tiffy_08.jpg - Robot and screens
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Digital Communion" \
  -Description="Humanoid android seated before wall of glowing screens with surveillance cameras" \
  -Keywords="android,robot,cyberpunk,screens,surveillance,laboratory,eerie,contemplative,sci-fi,dystopian" \
  "tiffy_08.jpg"

# tiffy_09.jpg - Robot reading by window
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Post-Apocalyptic Solitude" \
  -Description="Robot figure reading by window overlooking destroyed cityscape in amber light" \
  -Keywords="robot,cyborg,post-apocalyptic,reading,window,destroyed city,solitude,contemplative,sci-fi,dystopian" \
  "tiffy_09.jpg"

# tiffy_10.jpg - Paper boats in sky
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Sky Sailors" \
  -Description="Red origami boats sailing through clouds with figures aboard" \
  -Keywords="origami,paper boats,clouds,sky,sailing,dreamlike,surreal,wonder,adventure,fantasy" \
  "tiffy_10.jpg"

# tiffy_hires_01_portal - Magic portal room
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Arcane Portal Chamber" \
  -Description="Gothic arched chamber with swirling orange portal and flanking golden energy spheres" \
  -Keywords="portal,magic chamber,gothic arches,arcane,scrolls,candles,mysterious,mystical,sorcery,fantasy" \
  "tiffy_hires_01_portal_4000x3000.jpg"

# tiffy_hires_02_dragon - Eastern water dragon
exiftool -overwrite_original \
  -Artist="Tithi Luadthong (Grandfailure)" \
  -Copyright="© Tithi Luadthong" \
  -Source="Stock/Artist Portfolio" \
  -Title="Eastern Water Dragon" \
  -Description="Colossal ethereal water dragon ascending from sea near Asian temple village" \
  -Keywords="dragon,water dragon,Eastern,Asian,temples,pagoda,spectral,colossal,ascending,epic,fantasy" \
  "tiffy_hires_02_dragon_3500x1917.jpg"

echo "Tiffy art metadata complete!"
