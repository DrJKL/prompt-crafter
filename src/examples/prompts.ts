import { SavedPrompt, SavedPrompts } from './../common/saving/types';
import dedent from 'dedent';

/**
 * https://lemmy.dbzer0.com/post/1352473
 */
export const LANDSCAPE_VERY_DYNAMIC = dedent`
{cinematic shot | establishing shot | intimate scene | sweeping grandeur},(21:9 aspect ratio)

{(ultrawide panoramic cinematic aspect ratio)}

{Blender | Photoshop|Octane render|Unreal Engine 5|8K RAW Photo} ,  

{2-4$$lone twisted tree | winding river| mountain peak| crumbling ruins| abandoned cabin|wooden fence | dramatic cliffs | stormy sea | rolling thunder | howling wind | foggy moor | charred forest | broken-down cart| towering dunes | parched canyon | bone-strewn pit | petrified woods| wrecked galleon | beast's den| majestic waterfall | calm lake | moonlit trail  | moss-covered stones | misty vale |ravaged battlefield | derelict mill}   

{cirrus clouds |stormy sky|cumulus clouds|stratus clouds|nimbostratus clouds|cumulonimbus clouds}   

{clear | atmospheric fog | mist | haze | pollution| dust |smoke |atmospheric halo| sun dogs | moon dogs | sun pillars | circumzenithal arcs|circumhorizontal arcs},

{abstracted | concept art| Hyperrealistic| stylized| fantasy| impressionistic | photo| realistic }   

(16K, 32bit color, HDR, masterpiece, ultra quality)   

{brutalist | minimalist| whimsical| retro futurist}   

{muted tones | vibrant hues}  

{warm sunset tones |cool muted blues | colors}   

{natural | warm| dramatic }  

{god rays | sun beams | crepuscular rays| antisolar rays | volumetric light | light pillars | sun pillars | moon pillars},  

{dawn | sunset| night} {clear  | overcast | fog}   

{winter | spring | summer | autumn}   

{ volumetric shadows | volumetric ambiance | aerial perspective | depth fog},       

in the style of  
{1-2$$Dylan Furst  |Ash Thorp | Simon Stålenhag | Bob Ross| Ralph McQuarrie | Syd Mead| Moebius| Daarken| Felix Yoon| Gustave Doré| Arnold Böcklin| William Blake | Frank 
Frazetta| John Constable |J.C. Dahl }   
and
{1-2$$James Gurney | Craig Mullins| Android Jones |Justin Maller | John Berkey| Roger Dean| Rodney Matthews | Chris Foss| Nicolas Roeg | Geoffrey Hayes | John Harris| Dinotopia| Jon Foster| Brom| Brian Froud | Alan Lee},
`;

export const BASIC_ALPHABET_FOR_SEED_DEMO = dedent`
{A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z}
{A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z}
{A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z}
{A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z}
{A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z}
{A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z}
{A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z}
`;

export function getDefaultPrompts(): SavedPrompts {
  return [
    {
      name: 'Lemmy Dynamic Landscape',
      tags: ['Default'],
      contents: LANDSCAPE_VERY_DYNAMIC,
    },
    {
      name: 'Alphabet Demo',
      tags: ['Default'],
      contents: BASIC_ALPHABET_FOR_SEED_DEMO,
    },
  ];
}
