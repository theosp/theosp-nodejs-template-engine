(function () {
    // populate_template {{{
    exports.populateTemplate = function (template, components) {
        // based on Douglas Crockford's supplant

        // Conditional sections {% ?condition %} and {% !condition %} {{{

        // {% ?condition %} {{{
        template = template.replace(/{%\s*\?(\w+?)\s*%}([\s\S]*?){%\s*\/\?(\1)\s*%}/g, 
            function (original, conditional_section_name, content) {
                // keep original if unknown conditional section name {{{
                if (!(conditional_section_name in components.conditional_sections)) {
                    return original;
                }
                // }}}

                var condition = 
                        components.conditional_sections[conditional_section_name];

                if (typeof condition === 'function') {
                    if (condition() === true) {
                        return content;
                    } else {
                        return '';
                    }
                }

                if (condition === true) {
                    return content;
                } else {
                    return '';
                }

                return original;
            }
        );
        // }}}
        
        // {% !condition %} {{{
        template = template.replace(/{%\s*\!(\w+?)\s*%}([\s\S]*?){%\s*\/\!(\1)\s*%}/g, 
            function (original, conditional_section_name, content) {
                // keep original if unknown conditional section name {{{
                if (!(conditional_section_name in components.conditional_sections)) {
                    return original;
                }
                // }}}

                var condition = 
                        components.conditional_sections[conditional_section_name];

                if (typeof condition === 'function') {
                    if (condition() === false) {
                        return content;
                    } else {
                        return '';
                    }
                }

                if (condition === false) {
                    return content;
                } else {
                    return '';
                }

                return original;
            }
        );
        // }}}

        // }}}

        // iterators {% @iterator %}{{ (.|item.prop.prop) }}{{ /@iterator }} {{{
        template = template.replace(/{%\s*@(\w+?)\s*%}([\s\S]*?){%\s*\/@(\1)\s*%}/g, 
            function (original, iterator_name, content) {
                // keep original if unknown iterator name {{{
                if (!(iterator_name in components.iterators)) {
                    return original;
                }
                // }}}

                var iterator = 
                        components.iterators[iterator_name];

                if (Array.isArray(iterator)) {
                    var output = '';

                    for (var i = 0; i < iterator.length; i++) {
                        var item = iterator[i],
                            iteration_output = content;

                        // strings/numbers iterator {{{
                        if (typeof item === "string" || typeof item === "number") {

                            // {{ . }} {{{
                            iteration_output = iteration_output.replace(/{{\s*\.\s*}}/g, item);
                            // }}}

                        // }}}
                        // objects iterator {{{
                        } else if (typeof item === 'object') {

                            // {{ item.property_name }} {{{
                            iteration_output = iteration_output.replace(/{{\s*item\.(.*?)\s*}}/g, function (original, property_path) {
                                property_path = property_path.split('.');

                                var value_to_return = item;
                                for (var i = 0; i < property_path.length; i++) {
                                    var property = property_path[i];

                                    if (typeof item[property] === 'undefined') {
                                        return original;
                                    }

                                    value_to_return = item[property];
                                }

                                return value_to_return;
                            });
                            // }}}

                            // {% ?item.property_name %}{% /?item.property_name %} {{{
                            iteration_output = iteration_output.replace(/{%\s*\?item\.(\w+?)\s*%}([\s\S]*?){%\s*\/\?item\.(\1)\s*%}/g, function (original, property_path, content) {
                                property_path = property_path.split('.');

                                var value = item;
                                for (var i = 0; i < property_path.length; i++) {
                                    var property = property_path[i];

                                    if (typeof item[property] === 'undefined') {
                                        return original;
                                    }

                                    value = item[property];
                                }

                                if (value !== true) {
                                    return "";
                                }

                                return content;
                            });
                            // }}}

                            // {% !item.property_name %}{% /!item.property_name %} {{{
                            iteration_output = iteration_output.replace(/{%\s*!item\.(\w+?)\s*%}([\s\S]*?){%\s*\/!item\.(\1)\s*%}/g, function (original, property_path, content) {
                                property_path = property_path.split('.');

                                var value = item;
                                for (var i = 0; i < property_path.length; i++) {
                                    var property = property_path[i];

                                    if (typeof item[property] === 'undefined') {
                                        return original;
                                    }

                                    value = item[property];
                                }

                                if (value !== false) {
                                    return "";
                                }

                                return content;
                            });
                            // }}}

                        }
                        // }}}

                        // {% !first %}{% /!first %}{% ?first %}{% /?first %}|{% !last %}{% /!last %}{% ?last %}{% /?last %} {{{
                        iteration_output = iteration_output.replace(/{%\s*([?!])(first|last)\s*%}([\s\S]*?){%\s*\/\1\2\s*%}/g, 
                            function (original, mode, place, content) {
                                if (mode === '?') {
                                    mode = true;
                                } else {
                                    mode = false;
                                }

                                if (place === "first") {
                                    if ((i === 0) === mode) {
                                        return content;
                                    }
                                //} else if (place === "last") {
                                } else {
                                    if ((i === (iterator.length - 1)) === mode) {
                                        return content;
                                    }
                                }

                                return "";
                            }
                        );
                        // }}}

                        output += iteration_output.replace(/\s+$/, "");
                    }

                    return output.trim();
                }

                return original;
            }
        );
        // }}}

        // Tags {{ tag }} {{{
        template = template.replace(/{{\s*(\w+?)\s*}}/g, 
            function (original, tag_name) {  
                // keep original if unknown tag name {{{
                if (!(tag_name in components.tags)) {
                    return original;
                }
                // }}}

                var tag_val = components.tags[tag_name];

                if (typeof tag_val === 'function') {
                    return tag_val();
                }

                if (typeof tag_val === 'string' || typeof tag_val === 'number') {
                    return tag_val;
                }

                return original;
            }
        );
        // }}}

        return template;
    };
    // }}}
})();

// vim:fdm=marker:fmr={{{,}}}:
