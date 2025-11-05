var ModalEffects = (function() {

    function init() {

        var overlay = document.querySelector('.md-overlay');  // Overlay de fondo

        // Recorremos todos los botones de activación del modal
        [].slice.call(document.querySelectorAll('.md-trigger')).forEach(function(el, i) {

            var modal = document.querySelector('#' + el.getAttribute('data-modal')), // Seleccionamos el modal usando el ID
                close = modal.querySelector('.md-close'),  // Selector para el botón de cierre .md-close
                logoutClose = modal.querySelector('.logout-close');  // Selector para el botón .logout-close

            // Función para eliminar la clase 'md-show' y cerrar el modal
            function removeModal(hasPerspective) {
                classie.remove(modal, 'md-show');  // Eliminamos la clase que muestra el modal

                if (hasPerspective) {
                    classie.remove(document.documentElement, 'md-perspective');  // Elimina perspectiva si la hay
                }
            }

            // Función manejadora para el cierre del modal
            function removeModalHandler() {
                removeModal(classie.has(el, 'md-setperspective'));
            }

            // Evento para abrir el modal al hacer clic en un trigger
            el.addEventListener('click', function(ev) {
                classie.add(modal, 'md-show');  // Mostramos el modal
                overlay.removeEventListener('click', removeModalHandler);
                overlay.addEventListener('click', removeModalHandler);

                // Agregamos una clase para efectos de perspectiva si corresponde
                if (classie.has(el, 'md-setperspective')) {
                    setTimeout(function() {
                        classie.add(document.documentElement, 'md-perspective');
                    }, 25);
                }
            });

            // Cerrar el modal con el botón .md-close
            if (close) {
                close.addEventListener('click', function(ev) {
                    ev.stopPropagation();  // Prevenimos que el evento se propague
                    removeModalHandler();  // Llamamos a la función para cerrar el modal
                });
            }

            // Cerrar el modal con el botón .logout-close
            if (logoutClose) {
                logoutClose.addEventListener('click', function(ev) {
                    ev.stopPropagation();  // Prevenimos que el evento se propague
                    removeModalHandler();  // Llamamos a la función para cerrar el modal
                });
            }

        });

    }

    init();

})();
