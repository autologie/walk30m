module View.Facebook exposing (view)

import Html exposing (Html, div)
import Html.Attributes exposing (attribute, class)


view : Html msg
view =
    div
        [ class "fb-like"
        , attribute "data-action" "like"
        , attribute "data-href" "https://developers.facebook.com/docs/plugins/"
        , attribute "data-layout" "standard"
        , attribute "data-share" "true"
        , attribute "data-show-faces" "true"
        , attribute "data-size" "small"
        ]
        []
