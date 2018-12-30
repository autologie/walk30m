module Data.TravelMode exposing (TravelMode(..), decode, encode, parse)

import Json.Decode as Decode
import Json.Encode as Encode


type TravelMode
    = Driving
    | Walking


encode : TravelMode -> Encode.Value
encode mode =
    case mode of
        Driving ->
            Encode.string "DRIVING"

        Walking ->
            Encode.string "WALKING"


decode : Decode.Decoder TravelMode
decode =
    Decode.andThen
        (\str ->
            case parse str of
                Ok mode ->
                    Decode.succeed mode

                Err cause ->
                    Decode.fail cause
        )
        Decode.string


parse : String -> Result String TravelMode
parse str =
    case str of
        "DRIVING" ->
            Ok Driving

        "WALKING" ->
            Ok Walking

        other ->
            Err (other ++ " is not a valid travelMode.")
