module Data.Progress exposing (Polygon, Progress, decode, encode)

import Data.LatLng as LatLng exposing (LatLng)
import Json.Decode as Decode
import Json.Encode as Encode


type alias Progress =
    { result : List Polygon
    , visiting : List Polygon
    , progress : Float
    }


type alias Polygon =
    Encode.Value


decode =
    Decode.map3
        (\result visiting value ->
            { result = result
            , visiting = visiting
            , progress = value
            }
        )
        (Decode.field "result" (Decode.list Decode.value))
        (Decode.field "visiting" (Decode.list Decode.value))
        (Decode.field "progress" Decode.float)


encode : Progress -> Encode.Value
encode progress =
    Encode.object
        [ ( "type", Encode.string "FeatureCollection" )
        , ( "features"
          , Encode.list identity
                (List.map encodeResult progress.result
                    ++ List.map encodeVisiting progress.visiting
                )
          )
        ]


encodeVisiting : Polygon -> Encode.Value
encodeVisiting polygon =
    encodeFeature
        (Encode.object
            [ ( "style"
              , Encode.object
                    [ ( "fillColor", Encode.string "red" )
                    , ( "fillOpacity", Encode.float 0.3 )
                    , ( "strokeWeight", Encode.int 0 )
                    ]
              )
            ]
        )
        polygon


encodeResult : Polygon -> Encode.Value
encodeResult polygon =
    encodeFeature
        (Encode.object
            [ ( "style"
              , Encode.object
                    [ ( "fillColor", Encode.string "green" )
                    , ( "fillOpacity", Encode.float 0.4 )
                    , ( "strokeColor", Encode.string "green" )
                    , ( "strokeWeight", Encode.int 2 )
                    , ( "strokeOpacity", Encode.float 0.8 )
                    ]
              )
            ]
        )
        polygon


encodeFeature : Encode.Value -> Polygon -> Encode.Value
encodeFeature properties polygon =
    Encode.object
        [ ( "type", Encode.string "Feature" )
        , ( "properties", properties )
        , ( "geometry", polygon )
        ]
